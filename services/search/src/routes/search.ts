import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db, workItems, projects } from '@waddle/db';
import { eq, and, sql } from 'drizzle-orm';

export const searchRoutes = new Hono();

/** Full-text search using PostgreSQL tsvector */
searchRoutes.get('/', async (c) => {
  const q = c.req.query('q');
  const workspaceId = c.req.query('workspaceId');
  const type = c.req.query('type') ?? 'work_items';
  const limit = Math.min(Number(c.req.query('limit') ?? '25'), 100);

  if (!q || q.trim().length === 0) {
    throw new HTTPException(400, { message: 'q query param required' });
  }

  if (!workspaceId) {
    throw new HTTPException(400, { message: 'workspaceId query param required' });
  }

  try {
    if (type === 'projects') {
      const results = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.workspaceId, workspaceId),
            sql`to_tsvector('english', coalesce(${projects.name}, '') || ' ' || coalesce(${projects.description}, '')) @@ plainto_tsquery('english', ${q})`,
          ),
        )
        .limit(limit);

      return c.json({ data: results, meta: { query: q, type, total: results.length } });
    }

    // Default: search work items
    const results = await db
      .select()
      .from(workItems)
      .where(
        and(
          eq(workItems.workspaceId, workspaceId),
          sql`to_tsvector('english', coalesce(${workItems.title}, '') || ' ' || coalesce(${workItems.description}, '')) @@ plainto_tsquery('english', ${q})`,
        ),
      )
      .limit(limit);

    return c.json({ data: results, meta: { query: q, type, total: results.length } });
  } catch (err) {
    console.error('[search.fulltext]', err);
    throw new HTTPException(500, { message: 'Search failed' });
  }
});

/**
 * Semantic similarity search using pgvector.
 * Requires: CREATE EXTENSION vector; and an embedding column on work_items.
 * Falls back gracefully if pgvector is not available.
 */
searchRoutes.get('/similar/:workItemId', async (c) => {
  const workItemId = c.req.param('workItemId');
  const limit = Math.min(Number(c.req.query('limit') ?? '10'), 50);

  try {
    const [item] = await db
      .select()
      .from(workItems)
      .where(eq(workItems.id, workItemId))
      .limit(1);

    if (!item) throw new HTTPException(404, { message: 'Work item not found' });

    // Try pgvector cosine similarity — requires vector extension and embedding column
    try {
      const results = await db.execute(
        sql`
          SELECT id, title, description, priority, type
          FROM work_items
          WHERE id != ${workItemId}
            AND workspace_id = ${item.workspaceId}
            AND embedding IS NOT NULL
          ORDER BY embedding <=> (SELECT embedding FROM work_items WHERE id = ${workItemId})
          LIMIT ${limit}
        `,
      );

      return c.json({ data: results, meta: { workItemId, mode: 'semantic' } });
    } catch {
      // pgvector not available — fall back to title similarity
      const results = await db
        .select()
        .from(workItems)
        .where(
          and(
            eq(workItems.workspaceId, item.workspaceId),
            sql`similarity(${workItems.title}, ${item.title}) > 0.2`,
          ),
        )
        .limit(limit);

      return c.json({ data: results, meta: { workItemId, mode: 'title_similarity_fallback' } });
    }
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[search.similar]', err);
    throw new HTTPException(500, { message: 'Similar search failed' });
  }
});
