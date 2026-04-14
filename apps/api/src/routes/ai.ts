import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { WaddleAI } from '@waddle/ai';
import { db, workItems, activityLog, comments } from '@waddle/db';
import { eq, and, desc } from 'drizzle-orm';

export const aiRoutes = new Hono();

function getAI(): WaddleAI {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new HTTPException(503, { message: 'AI service not configured — OPENAI_API_KEY missing' });
  }
  return new WaddleAI({ provider: 'openai', model: 'gpt-4o-mini', apiKey });
}

/** Draft a structured work item from plain text */
aiRoutes.post('/draft-item', async (c) => {
  const body = await c.req.json();
  const schema = z.object({ description: z.string().min(1).max(5000) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    const ai = getAI();
    const result = await ai.draftWorkItem(parsed.data.description);
    return c.json({ data: result });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[ai.draft-item]', err);
    throw new HTTPException(500, { message: 'AI draft failed' });
  }
});

/** Sprint planning suggestions */
aiRoutes.post('/sprint-plan', async (c) => {
  const body = await c.req.json();
  const schema = z.object({
    projectId: z.string().uuid(),
    velocityTarget: z.number().optional(),
    previousSprintVelocity: z.number().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(workItems.projectId, parsed.data.projectId), eq(workItems.workspaceId, workspaceId))
      : eq(workItems.projectId, parsed.data.projectId);

    const items = await db.select().from(workItems).where(conditions).limit(100);

    const ai = getAI();
    const suggestions = await ai.suggestSprintItems({
      projectId: parsed.data.projectId,
      velocityTarget: parsed.data.velocityTarget,
      previousSprintVelocity: parsed.data.previousSprintVelocity,
      backlogItems: items.map((i) => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        type: i.type,
        estimatePoints: i.estimatePoints ?? undefined,
        assigneeId: i.assigneeId ?? undefined,
        labels: i.labels as string[],
      })),
    });

    return c.json({ data: suggestions });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[ai.sprint-plan]', err);
    throw new HTTPException(500, { message: 'AI sprint planning failed' });
  }
});

/** Risk radar — flag at-risk work items */
aiRoutes.post('/risk-radar', async (c) => {
  const body = await c.req.json();
  const schema = z.object({
    projectId: z.string().uuid(),
    sprintId: z.string().uuid().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = [eq(workItems.projectId, parsed.data.projectId)];
    if (workspaceId) conditions.push(eq(workItems.workspaceId, workspaceId));
    if (parsed.data.sprintId) conditions.push(eq(workItems.sprintId, parsed.data.sprintId));

    const items = await db
      .select()
      .from(workItems)
      .where(and(...conditions))
      .limit(100);

    const ai = getAI();
    const risks = await ai.analyzeRisks(
      items.map((i) => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        type: i.type,
        estimatePoints: i.estimatePoints ?? undefined,
        assigneeId: i.assigneeId ?? undefined,
        dueDate: i.dueDate?.toISOString(),
        labels: i.labels as string[],
      })),
    );

    return c.json({ data: risks });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[ai.risk-radar]', err);
    throw new HTTPException(500, { message: 'AI risk analysis failed' });
  }
});

/** Answer a natural language question about a project */
aiRoutes.post('/ask', async (c) => {
  const body = await c.req.json();
  const schema = z.object({
    question: z.string().min(1).max(1000),
    projectId: z.string().uuid(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = [eq(workItems.projectId, parsed.data.projectId)];
    if (workspaceId) conditions.push(eq(workItems.workspaceId, workspaceId));

    const [items, activity, projectComments] = await Promise.all([
      db.select().from(workItems).where(and(...conditions)).limit(50),
      db
        .select()
        .from(activityLog)
        .where(eq(activityLog.workspaceId, workspaceId ?? ''))
        .orderBy(desc(activityLog.timestamp))
        .limit(20),
      db.select().from(comments).limit(20),
    ]);

    const ai = getAI();
    const answer = await ai.answerQuestion(parsed.data.question, {
      projectId: parsed.data.projectId,
      workItems: items.map((i) => ({
        id: i.id,
        title: i.title,
        priority: i.priority,
        type: i.type,
        estimatePoints: i.estimatePoints ?? undefined,
        assigneeId: i.assigneeId ?? undefined,
        dueDate: i.dueDate?.toISOString(),
        labels: i.labels as string[],
      })),
      recentActivity: activity.map((a) => ({
        action: a.action,
        timestamp: a.timestamp.toISOString(),
        entityId: a.entityId,
      })),
      comments: projectComments.map((c) => ({ body: c.body, workItemId: c.workItemId })),
    });

    return c.json({ data: { answer } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[ai.ask]', err);
    throw new HTTPException(500, { message: 'AI Q&A failed' });
  }
});
