import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

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

/** List work items (with filtering) */
workItemRoutes.get('/', (c) => {
  const projectId = c.req.query('projectId');
  const status = c.req.query('status');
  const type = c.req.query('type');
  const assigneeId = c.req.query('assigneeId');

  // TODO: Implement with DB query + filters
  return c.json({
    data: [],
    meta: {
      total: 0,
      filters: { projectId, status, type, assigneeId },
    },
  });
});

/** Create a new work item */
workItemRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createWorkItemSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  // TODO: Implement with DB insert + auto-incrementing number
  return c.json(
    {
      data: {
        id: 'placeholder-uuid',
        number: 1,
        ...parsed.data,
        priority: parsed.data.priority ?? 'none',
        labels: parsed.data.labels ?? [],
        customFields: parsed.data.customFields ?? {},
        sortOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    201,
  );
});

/** Get work item by ID */
workItemRoutes.get('/:id', (c) => {
  const id = c.req.param('id');
  // TODO: Implement with DB query
  return c.json({
    data: { id, message: 'Not yet implemented' },
  });
});

/** Update a work item */
workItemRoutes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = updateWorkItemSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, {
      message: 'Validation failed',
      cause: parsed.error.flatten(),
    });
  }

  // TODO: Implement with DB update + activity log
  return c.json({
    data: { id, ...parsed.data, updatedAt: new Date().toISOString() },
  });
});

/** Delete a work item */
workItemRoutes.delete('/:id', (c) => {
  const id = c.req.param('id');
  // TODO: Implement with DB delete
  return c.json({ data: { id, deleted: true } });
});
