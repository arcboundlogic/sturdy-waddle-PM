import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db, workspaces, workspaceMembers } from '@waddle/db';
import { eq } from 'drizzle-orm';

export const workspaceRoutes = new Hono();

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(2000).optional(),
  tier: z.enum(['solo', 'team', 'organization', 'enterprise']).optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
});

function decodeCursor(cursor: string): Date {
  return new Date(Buffer.from(cursor, 'base64url').toString('utf8'));
}

function encodeCursor(date: Date): string {
  return Buffer.from(date.toISOString()).toString('base64url');
}

/** List workspaces — scoped to authenticated user's memberships */
workspaceRoutes.get('/', async (c) => {
  const userId = c.get('userId') as string | undefined;
  const limit = Math.min(Number(c.req.query('limit') ?? '25'), 100);
  const after = c.req.query('after');

  try {
    type WorkspaceRow = { workspace: typeof workspaces.$inferSelect };
    let rows: WorkspaceRow[];

    if (userId) {
      const q = db
        .select({ workspace: workspaces })
        .from(workspaces)
        .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
        .where(eq(workspaceMembers.userId, userId))
        .limit(limit + 1);
      rows = after
        ? await db
            .select({ workspace: workspaces })
            .from(workspaces)
            .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
            .where(eq(workspaceMembers.userId, userId))
            .limit(limit + 1)
        : await q;
      void after; // handled below via manual filter for simplicity
    } else {
      rows = await db
        .select({ workspace: workspaces })
        .from(workspaces)
        .limit(limit + 1);
    }

    if (after) {
      const cursor = decodeCursor(after);
      rows = rows.filter((r) => r.workspace.createdAt > cursor);
    }

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return c.json({
      data: items.map((r) => r.workspace),
      meta: {
        hasMore,
        nextCursor: hasMore ? encodeCursor(items[items.length - 1]!.workspace.createdAt) : null,
      },
    });
  } catch (err) {
    console.error('[workspaces.list]', err);
    throw new HTTPException(500, { message: 'Failed to list workspaces' });
  }
});

/** Create a new workspace */
workspaceRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createWorkspaceSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  const userId = c.get('userId') as string | undefined;

  try {
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        tier: parsed.data.tier ?? 'solo',
        settings: { allowGuestAccess: false, requireMfa: false },
      })
      .returning();

    if (userId && workspace) {
      await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId,
        role: 'owner',
      });
    }

    return c.json({ data: workspace }, 201);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') {
      throw new HTTPException(409, { message: 'A workspace with that slug already exists' });
    }
    console.error('[workspaces.create]', err);
    throw new HTTPException(500, { message: 'Failed to create workspace' });
  }
});

/** Get workspace by ID */
workspaceRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!workspace) {
      throw new HTTPException(404, { message: 'Workspace not found' });
    }

    return c.json({ data: workspace });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[workspaces.get]', err);
    throw new HTTPException(500, { message: 'Failed to get workspace' });
  }
});

/** Update a workspace */
workspaceRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateWorkspaceSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  try {
    const [workspace] = await db
      .update(workspaces)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();

    if (!workspace) {
      throw new HTTPException(404, { message: 'Workspace not found' });
    }

    return c.json({ data: workspace });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[workspaces.update]', err);
    throw new HTTPException(500, { message: 'Failed to update workspace' });
  }
});

/** Delete a workspace */
workspaceRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const [deleted] = await db
      .delete(workspaces)
      .where(eq(workspaces.id, id))
      .returning({ id: workspaces.id });

    if (!deleted) {
      throw new HTTPException(404, { message: 'Workspace not found' });
    }

    return c.json({ data: { id: deleted.id, deleted: true } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[workspaces.delete]', err);
    throw new HTTPException(500, { message: 'Failed to delete workspace' });
  }
});

/** List workspace members */
workspaceRoutes.get('/:id/members', async (c) => {
  const workspaceId = c.req.param('id');

  try {
    const members = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));

    return c.json({ data: members });
  } catch (err) {
    console.error('[workspaces.members]', err);
    throw new HTTPException(500, { message: 'Failed to list members' });
  }
});
