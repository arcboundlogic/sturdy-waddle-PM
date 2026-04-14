import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db, projects } from '@waddle/db';
import { eq, and } from 'drizzle-orm';

export const projectRoutes = new Hono();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  key: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/, 'Key must be uppercase alphanumeric starting with a letter'),
  description: z.string().max(5000).optional(),
  portfolioId: z.string().uuid().optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  isArchived: z.boolean().optional(),
});

function decodeCursor(cursor: string): Date {
  return new Date(Buffer.from(cursor, 'base64url').toString('utf8'));
}

function encodeCursor(date: Date): string {
  return Buffer.from(date.toISOString()).toString('base64url');
}

/** List projects in a workspace */
projectRoutes.get('/', async (c) => {
  const workspaceId = c.get('workspaceId') as string | undefined;
  const limit = Math.min(Number(c.req.query('limit') ?? '25'), 100);
  const after = c.req.query('after');
  const includeArchived = c.req.query('archived') === 'true';

  if (!workspaceId) {
    throw new HTTPException(400, { message: 'Workspace context required' });
  }

  try {
    let rows = await db
      .select()
      .from(projects)
      .where(
        includeArchived
          ? eq(projects.workspaceId, workspaceId)
          : and(eq(projects.workspaceId, workspaceId), eq(projects.isArchived, false)),
      )
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
    console.error('[projects.list]', err);
    throw new HTTPException(500, { message: 'Failed to list projects' });
  }
});

/** Create a new project */
projectRoutes.post('/', async (c) => {
  const workspaceId = c.get('workspaceId') as string | undefined;
  if (!workspaceId) throw new HTTPException(400, { message: 'Workspace context required' });

  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  try {
    const [project] = await db
      .insert(projects)
      .values({
        workspaceId,
        name: parsed.data.name,
        key: parsed.data.key,
        description: parsed.data.description,
        portfolioId: parsed.data.portfolioId,
        color: parsed.data.color,
      })
      .returning();

    return c.json({ data: project }, 201);
  } catch (err: unknown) {
    console.error('[projects.create]', err);
    throw new HTTPException(500, { message: 'Failed to create project' });
  }
});

/** Get project by ID */
projectRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(projects.id, id), eq(projects.workspaceId, workspaceId))
      : eq(projects.id, id);

    const [project] = await db.select().from(projects).where(conditions).limit(1);

    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    return c.json({ data: project });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[projects.get]', err);
    throw new HTTPException(500, { message: 'Failed to get project' });
  }
});

/** Update a project */
projectRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  try {
    const conditions = workspaceId
      ? and(eq(projects.id, id), eq(projects.workspaceId, workspaceId))
      : eq(projects.id, id);

    const [project] = await db
      .update(projects)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(conditions)
      .returning();

    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    return c.json({ data: project });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[projects.update]', err);
    throw new HTTPException(500, { message: 'Failed to update project' });
  }
});

/** Delete a project */
projectRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const workspaceId = c.get('workspaceId') as string | undefined;

  try {
    const conditions = workspaceId
      ? and(eq(projects.id, id), eq(projects.workspaceId, workspaceId))
      : eq(projects.id, id);

    const [deleted] = await db.delete(projects).where(conditions).returning({ id: projects.id });

    if (!deleted) {
      throw new HTTPException(404, { message: 'Project not found' });
    }

    return c.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[projects.delete]', err);
    throw new HTTPException(500, { message: 'Failed to delete project' });
  }
});
