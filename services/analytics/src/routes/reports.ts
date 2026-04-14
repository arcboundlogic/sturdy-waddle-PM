import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db, sprints, workItems, activityLog } from '@waddle/db';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export const burndownRoutes = new Hono();

/** Burndown chart data for a sprint */
burndownRoutes.get('/burndown', async (c) => {
  const sprintId = c.req.query('sprintId');
  if (!sprintId) throw new HTTPException(400, { message: 'sprintId query param required' });

  try {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, sprintId)).limit(1);
    if (!sprint) throw new HTTPException(404, { message: 'Sprint not found' });

    // Get all work items in the sprint
    const items = await db
      .select({ id: workItems.id, estimatePoints: workItems.estimatePoints })
      .from(workItems)
      .where(eq(workItems.sprintId, sprintId));

    const totalPoints = items.reduce((sum, i) => sum + (i.estimatePoints ?? 1), 0);

    // Get activity log for status_changed events during sprint
    const activities = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.entityType, 'work_item'),
          eq(activityLog.action, 'status_changed'),
          gte(activityLog.timestamp, sprint.startDate),
          lte(activityLog.timestamp, sprint.endDate),
        ),
      );

    // Build day-by-day burndown
    const start = sprint.startDate;
    const end = sprint.endDate;
    const days: Array<{ date: string; remaining: number }> = [];
    let remaining = totalPoints;

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]!;
      // Find activities on this day that represent completion
      const dayActivities = activities.filter((a) => {
        return a.timestamp.toISOString().split('T')[0] === dateStr;
      });

      // Estimate points burned based on completed items
      for (const activity of dayActivities) {
        const changes = activity.changes as { to?: string } | null;
        // If transitioned to a 'done'-like status, subtract points
        if (changes?.to) {
          const item = items.find((i) => i.id === activity.entityId);
          remaining = Math.max(0, remaining - (item?.estimatePoints ?? 1));
        }
      }

      days.push({ date: dateStr, remaining });
      current.setDate(current.getDate() + 1);
    }

    return c.json({
      data: {
        sprintId,
        sprintName: sprint.name,
        startDate: sprint.startDate.toISOString(),
        endDate: sprint.endDate.toISOString(),
        totalPoints,
        burndown: days,
      },
    });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[analytics.burndown]', err);
    throw new HTTPException(500, { message: 'Failed to compute burndown' });
  }
});

/** Velocity trend for a project (last N sprints) */
burndownRoutes.get('/velocity', async (c) => {
  const projectId = c.req.query('projectId');
  const sprintsCount = Math.min(Number(c.req.query('sprints') ?? '5'), 20);

  if (!projectId) throw new HTTPException(400, { message: 'projectId query param required' });

  try {
    const completedSprints = await db
      .select()
      .from(sprints)
      .where(and(eq(sprints.projectId, projectId), eq(sprints.status, 'completed')))
      .limit(sprintsCount);

    const velocityData = await Promise.all(
      completedSprints.map(async (sprint) => {
        const items = await db
          .select({ estimatePoints: workItems.estimatePoints })
          .from(workItems)
          .where(eq(workItems.sprintId, sprint.id));

        const points = items.reduce((sum, i) => sum + (i.estimatePoints ?? 0), 0);
        return { sprintId: sprint.id, sprintName: sprint.name, completedPoints: points };
      }),
    );

    const avg =
      velocityData.length > 0
        ? velocityData.reduce((s, v) => s + v.completedPoints, 0) / velocityData.length
        : 0;

    return c.json({ data: { projectId, velocityData, averageVelocity: Math.round(avg) } });
  } catch (err) {
    console.error('[analytics.velocity]', err);
    throw new HTTPException(500, { message: 'Failed to compute velocity' });
  }
});

/** Cycle time distribution by work item type */
burndownRoutes.get('/cycle-time', async (c) => {
  const projectId = c.req.query('projectId');
  if (!projectId) throw new HTTPException(400, { message: 'projectId query param required' });

  try {
    // Compute cycle time as time from creation to last update for each item
    const items = await db
      .select({
        id: workItems.id,
        type: workItems.type,
        createdAt: workItems.createdAt,
        updatedAt: workItems.updatedAt,
      })
      .from(workItems)
      .where(eq(workItems.projectId, projectId))
      .limit(500);

    const byType: Record<string, number[]> = {};
    for (const item of items) {
      const cycleHours =
        (item.updatedAt.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60);
      if (!byType[item.type]) byType[item.type] = [];
      byType[item.type]!.push(cycleHours);
    }

    const result = Object.entries(byType).map(([type, times]) => ({
      type,
      count: times.length,
      avgHours: times.reduce((a, b) => a + b, 0) / times.length,
      minHours: Math.min(...times),
      maxHours: Math.max(...times),
    }));

    return c.json({ data: result });
  } catch (err) {
    console.error('[analytics.cycle-time]', err);
    throw new HTTPException(500, { message: 'Failed to compute cycle time' });
  }
});
