import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db, automations } from '@waddle/db';
import { eq, and } from 'drizzle-orm';

export const automationRoutes = new Hono();

const createAutomationSchema = z.object({
  name: z.string().min(1).max(255),
  projectId: z.string().uuid().optional(),
  isEnabled: z.boolean().optional(),
  trigger: z.object({
    type: z.enum(['status_changed', 'assigned', 'due_date_approaching', 'created']),
    conditions: z.record(z.unknown()).optional(),
  }),
  actions: z.array(
    z.object({
      type: z.enum(['auto_assign', 'add_label', 'transition_status', 'post_comment', 'send_notification']),
      params: z.record(z.unknown()),
    }),
  ),
});

const updateAutomationSchema = createAutomationSchema.partial();

/** List automations */
automationRoutes.get('/', async (c) => {
  const workspaceId = c.get('workspaceId') as string | undefined;
  if (!workspaceId) throw new HTTPException(400, { message: 'Workspace context required' });

  try {
    const rows = await db
      .select()
      .from(automations)
      .where(eq(automations.workspaceId, workspaceId));

    return c.json({ data: rows });
  } catch (err) {
    console.error('[automations.list]', err);
    throw new HTTPException(500, { message: 'Failed to list automations' });
  }
});

/** Create automation */
automationRoutes.post('/', async (c) => {
  const workspaceId = c.get('workspaceId') as string | undefined;
  if (!workspaceId) throw new HTTPException(400, { message: 'Workspace context required' });

  const body = await c.req.json();
  const parsed = createAutomationSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    const [automation] = await db
      .insert(automations)
      .values({
        workspaceId,
        projectId: parsed.data.projectId,
        name: parsed.data.name,
        isEnabled: parsed.data.isEnabled ?? true,
        trigger: parsed.data.trigger,
        actions: parsed.data.actions,
      })
      .returning();

    return c.json({ data: automation }, 201);
  } catch (err) {
    console.error('[automations.create]', err);
    throw new HTTPException(500, { message: 'Failed to create automation' });
  }
});

/** Get automation by ID */
automationRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(automations.id, id), eq(automations.workspaceId, workspaceId))
      : eq(automations.id, id);

    const [automation] = await db.select().from(automations).where(conditions).limit(1);
    if (!automation) throw new HTTPException(404, { message: 'Automation not found' });
    return c.json({ data: automation });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to get automation' });
  }
});

/** Update automation */
automationRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  const body = await c.req.json();
  const parsed = updateAutomationSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    const conditions = workspaceId
      ? and(eq(automations.id, id), eq(automations.workspaceId, workspaceId))
      : eq(automations.id, id);

    const [automation] = await db
      .update(automations)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(conditions)
      .returning();

    if (!automation) throw new HTTPException(404, { message: 'Automation not found' });
    return c.json({ data: automation });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to update automation' });
  }
});

/** Delete automation */
automationRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(automations.id, id), eq(automations.workspaceId, workspaceId))
      : eq(automations.id, id);

    const [deleted] = await db.delete(automations).where(conditions).returning({ id: automations.id });
    if (!deleted) throw new HTTPException(404, { message: 'Automation not found' });
    return c.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to delete automation' });
  }
});
