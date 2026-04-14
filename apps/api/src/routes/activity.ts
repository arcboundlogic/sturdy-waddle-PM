import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db, activityLog } from '@waddle/db';
import { eq, and } from 'drizzle-orm';

export const activityRoutes = new Hono();

/** Get activity log for a work item */
activityRoutes.get('/work-items/:workItemId/activity', async (c) => {
  const workItemId = c.req.param('workItemId');
  const limit = Math.min(Number(c.req.query('limit') ?? '50'), 100);

  try {
    const rows = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.entityType, 'work_item'),
          eq(activityLog.entityId, workItemId),
        ),
      )
      .limit(limit);

    return c.json({ data: rows });
  } catch (err) {
    console.error('[activity.list]', err);
    throw new HTTPException(500, { message: 'Failed to get activity log' });
  }
});
