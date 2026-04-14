import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

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

/** List workspaces for authenticated user */
workspaceRoutes.get('/', (c) => {
  // TODO: Implement with DB query
  return c.json({
    data: [],
    meta: { total: 0 },
  });
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

  // TODO: Implement with DB insert
  return c.json(
    {
      data: {
        id: 'placeholder-uuid',
        ...parsed.data,
        tier: parsed.data.tier ?? 'solo',
        settings: { allowGuestAccess: false, requireMfa: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    201,
  );
});

/** Get workspace by ID */
workspaceRoutes.get('/:id', (c) => {
  const id = c.req.param('id');
  // TODO: Implement with DB query
  return c.json({
    data: { id, message: 'Not yet implemented' },
  });
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

  // TODO: Implement with DB update
  return c.json({
    data: { id, ...parsed.data, updatedAt: new Date().toISOString() },
  });
});

/** Delete a workspace */
workspaceRoutes.delete('/:id', (c) => {
  const id = c.req.param('id');
  // TODO: Implement with DB delete
  return c.json({ data: { id, deleted: true } });
});
