import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db, sprints, workItems } from '@waddle/db';
import { eq, and } from 'drizzle-orm';

export const sprintRoutes = new Hono();

const createSprintSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  goal: z.string().max(2000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const updateSprintSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  goal: z.string().max(2000).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['planning', 'active', 'completed']).optional(),
});

function encodeCursor(date: Date): string {
  return Buffer.from(date.toISOString()).toString('base64url');
}

/** List sprints */
sprintRoutes.get('/', async (c) => {
  const projectId = c.req.query('projectId');
  const limit = Math.min(Number(c.req.query('limit') ?? '25'), 100);

  try {
    const rows = await db
      .select()
      .from(sprints)
      .where(projectId ? eq(sprints.projectId, projectId) : undefined)
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return c.json({
      data: items,
      meta: {
        hasMore,
        nextCursor: hasMore ? encodeCursor(items[items.length - 1]!.createdAt) : null,
      },
    });
  } catch (err) {
    console.error('[sprints.list]', err);
    throw new HTTPException(500, { message: 'Failed to list sprints' });
  }
});

/** Create a sprint */
sprintRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createSprintSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    const [sprint] = await db
      .insert(sprints)
      .values({
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        goal: parsed.data.goal,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      })
      .returning();

    return c.json({ data: sprint }, 201);
  } catch (err) {
    console.error('[sprints.create]', err);
    throw new HTTPException(500, { message: 'Failed to create sprint' });
  }
});

/** Get sprint by ID */
sprintRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, id)).limit(1);
    if (!sprint) throw new HTTPException(404, { message: 'Sprint not found' });
    return c.json({ data: sprint });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to get sprint' });
  }
});

/** Update a sprint */
sprintRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateSprintSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) updateData['name'] = parsed.data.name;
    if (parsed.data.goal !== undefined) updateData['goal'] = parsed.data.goal;
    if (parsed.data.status !== undefined) updateData['status'] = parsed.data.status;
    if (parsed.data.startDate) updateData['startDate'] = new Date(parsed.data.startDate);
    if (parsed.data.endDate) updateData['endDate'] = new Date(parsed.data.endDate);

    const [sprint] = await db
      .update(sprints)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(updateData as any)
      .where(eq(sprints.id, id))
      .returning();

    if (!sprint) throw new HTTPException(404, { message: 'Sprint not found' });
    return c.json({ data: sprint });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to update sprint' });
  }
});

/** Delete a sprint */
sprintRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const [deleted] = await db
      .delete(sprints)
      .where(eq(sprints.id, id))
      .returning({ id: sprints.id });

    if (!deleted) throw new HTTPException(404, { message: 'Sprint not found' });
    return c.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to delete sprint' });
  }
});

/** Complete a sprint — moves remaining items out of the sprint */
sprintRoutes.post('/:id/complete', async (c) => {
  const id = c.req.param('id');

  try {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, id)).limit(1);
    if (!sprint) throw new HTTPException(404, { message: 'Sprint not found' });

    // Move incomplete items out of sprint
    await db
      .update(workItems)
      .set({ sprintId: null, updatedAt: new Date() })
      .where(and(eq(workItems.sprintId, id)));

    const [completed] = await db
      .update(sprints)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(sprints.id, id))
      .returning();

    return c.json({ data: completed });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to complete sprint' });
  }
});
