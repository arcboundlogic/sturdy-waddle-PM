import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db, workItems, activityLog, workflowTransitions } from '@waddle/db';
import { eq, and, sql } from 'drizzle-orm';

export const workItemRoutes = new Hono();

// Validation schemas
const createWorkItemSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['task', 'story', 'bug', 'epic', 'initiative', 'subtask']),
  title: z.string().min(1).max(500),
  description: z.string().max(50000).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
  assigneeId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  sprintId: z.string().uuid().optional(),
  workflowStatusId: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  estimatePoints: z.number().min(0).optional(),
  labels: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

const updateWorkItemSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(50000).optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  workflowStatusId: z.string().uuid().optional(),
  sprintId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  estimatePoints: z.number().min(0).nullable().optional(),
  labels: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
  sortOrder: z.number().optional(),
});

const transitionSchema = z.object({
  toStatusId: z.string().uuid(),
});

function decodeCursor(cursor: string): Date {
  return new Date(Buffer.from(cursor, 'base64url').toString('utf8'));
}

function encodeCursor(date: Date): string {
  return Buffer.from(date.toISOString()).toString('base64url');
}

/** List work items (with filtering) */
workItemRoutes.get('/', async (c) => {
  const workspaceId = c.get('workspaceId') as string | undefined;
  const projectId = c.req.query('projectId');
  const sprintId = c.req.query('sprintId');
  const assigneeId = c.req.query('assigneeId');
  const limit = Math.min(Number(c.req.query('limit') ?? '25'), 100);
  const after = c.req.query('after');

  try {
    const conditions = [];
    if (workspaceId) conditions.push(eq(workItems.workspaceId, workspaceId));
    if (projectId) conditions.push(eq(workItems.projectId, projectId));
    if (sprintId) conditions.push(eq(workItems.sprintId, sprintId));
    if (assigneeId) conditions.push(eq(workItems.assigneeId, assigneeId));

    let rows = await db
      .select()
      .from(workItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit + 1);

    if (after) {
      const cursor = decodeCursor(after);
      rows = rows.filter((r) => r.createdAt > cursor);
    }

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
    console.error('[work-items.list]', err);
    throw new HTTPException(500, { message: 'Failed to list work items' });
  }
});

/** Create a new work item */
workItemRoutes.post('/', async (c) => {
  const workspaceId = c.get('workspaceId') as string | undefined;
  if (!workspaceId) throw new HTTPException(400, { message: 'Workspace context required' });

  const body = await c.req.json();
  const parsed = createWorkItemSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  const userId = c.get('userId') as string | undefined;

  try {
    // Auto-increment number per project
    const [maxRow] = await db
      .select({ maxNum: sql<number>`coalesce(max(${workItems.number}), 0)` })
      .from(workItems)
      .where(eq(workItems.projectId, parsed.data.projectId));

    const number = (maxRow?.maxNum ?? 0) + 1;

    const [item] = await db
      .insert(workItems)
      .values({
        workspaceId,
        projectId: parsed.data.projectId,
        type: parsed.data.type,
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority ?? 'none',
        assigneeId: parsed.data.assigneeId,
        parentId: parsed.data.parentId,
        sprintId: parsed.data.sprintId,
        workflowStatusId: parsed.data.workflowStatusId,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        estimatePoints: parsed.data.estimatePoints,
        labels: parsed.data.labels ?? [],
        customFields: parsed.data.customFields ?? {},
        number,
        sortOrder: 0,
      })
      .returning();

    // Log activity
    if (item && userId) {
      await db.insert(activityLog).values({
        workspaceId,
        actorId: userId,
        entityType: 'work_item',
        entityId: item.id,
        action: 'created',
        changes: { title: item.title, type: item.type },
      }).catch(() => null);
    }

    return c.json({ data: item }, 201);
  } catch (err) {
    console.error('[work-items.create]', err);
    throw new HTTPException(500, { message: 'Failed to create work item' });
  }
});

/** Get work item by ID */
workItemRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId))
      : eq(workItems.id, id);

    const [item] = await db.select().from(workItems).where(conditions).limit(1);

    if (!item) {
      throw new HTTPException(404, { message: 'Work item not found' });
    }

    return c.json({ data: item });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[work-items.get]', err);
    throw new HTTPException(500, { message: 'Failed to get work item' });
  }
});

/** Update a work item */
workItemRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;
  const userId = c.get('userId') as string | undefined;

  const body = await c.req.json();
  const parsed = updateWorkItemSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  try {
    const conditions = workspaceId
      ? and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId))
      : eq(workItems.id, id);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.title !== undefined) updateData['title'] = parsed.data.title;
    if (parsed.data.description !== undefined) updateData['description'] = parsed.data.description;
    if (parsed.data.priority !== undefined) updateData['priority'] = parsed.data.priority;
    if (parsed.data.assigneeId !== undefined) updateData['assigneeId'] = parsed.data.assigneeId;
    if (parsed.data.workflowStatusId !== undefined) updateData['workflowStatusId'] = parsed.data.workflowStatusId;
    if (parsed.data.sprintId !== undefined) updateData['sprintId'] = parsed.data.sprintId;
    if (parsed.data.estimatePoints !== undefined) updateData['estimatePoints'] = parsed.data.estimatePoints;
    if (parsed.data.labels !== undefined) updateData['labels'] = parsed.data.labels;
    if (parsed.data.customFields !== undefined) updateData['customFields'] = parsed.data.customFields;
    if (parsed.data.sortOrder !== undefined) updateData['sortOrder'] = parsed.data.sortOrder;
    if (parsed.data.dueDate !== undefined) {
      updateData['dueDate'] = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    }

    const [item] = await db
      .update(workItems)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set(updateData as any)
      .where(conditions)
      .returning();

    if (!item) {
      throw new HTTPException(404, { message: 'Work item not found' });
    }

    // Log activity
    if (userId && workspaceId) {
      await db.insert(activityLog).values({
        workspaceId,
        actorId: userId,
        entityType: 'work_item',
        entityId: item.id,
        action: 'updated',
        changes: parsed.data as Record<string, unknown>,
      }).catch(() => null);
    }

    return c.json({ data: item });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[work-items.update]', err);
    throw new HTTPException(500, { message: 'Failed to update work item' });
  }
});

/** Delete a work item */
workItemRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId))
      : eq(workItems.id, id);

    const [deleted] = await db.delete(workItems).where(conditions).returning({ id: workItems.id });

    if (!deleted) {
      throw new HTTPException(404, { message: 'Work item not found' });
    }

    return c.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[work-items.delete]', err);
    throw new HTTPException(500, { message: 'Failed to delete work item' });
  }
});

/** Transition work item to a new workflow status */
workItemRoutes.post('/:id/transition', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;
  const userId = c.get('userId') as string | undefined;

  const body = await c.req.json();
  const parsed = transitionSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  try {
    const conditions = workspaceId
      ? and(eq(workItems.id, id), eq(workItems.workspaceId, workspaceId))
      : eq(workItems.id, id);

    const [item] = await db.select().from(workItems).where(conditions).limit(1);

    if (!item) {
      throw new HTTPException(404, { message: 'Work item not found' });
    }

    const currentStatusId = item.workflowStatusId;
    const { toStatusId } = parsed.data;

    // Check if transition is allowed
    const [transition] = await db
      .select()
      .from(workflowTransitions)
      .where(
        and(
          eq(workflowTransitions.fromStatusId, currentStatusId),
          eq(workflowTransitions.toStatusId, toStatusId),
        ),
      )
      .limit(1);

    if (!transition) {
      throw new HTTPException(422, {
        message: `Transition from current status to '${toStatusId}' is not allowed`,
        cause: { code: 'INVALID_TRANSITION' },
      });
    }

    const [updated] = await db
      .update(workItems)
      .set({ workflowStatusId: toStatusId, updatedAt: new Date() })
      .where(conditions)
      .returning();

    // Log activity
    if (updated && userId && workspaceId) {
      await db.insert(activityLog).values({
        workspaceId,
        actorId: userId,
        entityType: 'work_item',
        entityId: updated.id,
        action: 'status_changed',
        changes: { from: currentStatusId, to: toStatusId },
      }).catch(() => null);
    }

    return c.json({ data: updated });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[work-items.transition]', err);
    throw new HTTPException(500, { message: 'Failed to transition work item' });
  }
});
