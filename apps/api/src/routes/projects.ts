import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

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

/** List projects in a workspace */
projectRoutes.get('/', (c) => {
  // TODO: Implement with DB query, filtered by workspace
  return c.json({
    data: [],
    meta: { total: 0 },
  });
});

/** Create a new project */
projectRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);

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
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    201,
  );
});

/** Get project by ID */
projectRoutes.get('/:id', (c) => {
  const id = c.req.param('id');
  // TODO: Implement with DB query
  return c.json({
    data: { id, message: 'Not yet implemented' },
  });
});

/** Update a project */
projectRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);

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

/** Delete a project */
projectRoutes.delete('/:id', (c) => {
  const id = c.req.param('id');
  // TODO: Implement with DB delete
  return c.json({ data: { id, deleted: true } });
});
