import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { db, comments } from '@waddle/db';
import { eq } from 'drizzle-orm';

export const commentRoutes = new Hono();

const createCommentSchema = z.object({
  body: z.string().min(1).max(50000),
  parentCommentId: z.string().uuid().optional(),
});

const updateCommentSchema = z.object({
  body: z.string().min(1).max(50000),
});

function encodeCursor(date: Date): string {
  return Buffer.from(date.toISOString()).toString('base64url');
}

/** List comments for a work item */
commentRoutes.get('/work-items/:workItemId/comments', async (c) => {
  const workItemId = c.req.param('workItemId');
  const limit = Math.min(Number(c.req.query('limit') ?? '50'), 100);

  try {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.workItemId, workItemId))
      .limit(limit + 1);

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
    console.error('[comments.list]', err);
    throw new HTTPException(500, { message: 'Failed to list comments' });
  }
});

/** Create a comment on a work item */
commentRoutes.post('/work-items/:workItemId/comments', async (c) => {
  const workItemId = c.req.param('workItemId');
  const userId = c.get('userId') as string | undefined;

  if (!userId) throw new HTTPException(401, { message: 'Authentication required' });

  const body = await c.req.json();
  const parsed = createCommentSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    const [comment] = await db
      .insert(comments)
      .values({
        workItemId,
        authorId: userId,
        body: parsed.data.body,
        parentCommentId: parsed.data.parentCommentId,
      })
      .returning();

    return c.json({ data: comment }, 201);
  } catch (err) {
    console.error('[comments.create]', err);
    throw new HTTPException(500, { message: 'Failed to create comment' });
  }
});

/** Update a comment */
commentRoutes.patch('/comments/:id', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId') as string | undefined;

  const body = await c.req.json();
  const parsed = updateCommentSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  try {
    // Verify ownership
    const [existing] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (!existing) throw new HTTPException(404, { message: 'Comment not found' });
    if (userId && existing.authorId !== userId) {
      throw new HTTPException(403, { message: 'You can only edit your own comments' });
    }

    const [comment] = await db
      .update(comments)
      .set({ body: parsed.data.body, isEdited: true, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();

    return c.json({ data: comment });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to update comment' });
  }
});

/** Delete a comment */
commentRoutes.delete('/comments/:id', async (c) => {
  const id = c.req.param('id');
  const userId = c.get('userId') as string | undefined;

  try {
    const [existing] = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
    if (!existing) throw new HTTPException(404, { message: 'Comment not found' });
    if (userId && existing.authorId !== userId) {
      throw new HTTPException(403, { message: 'You can only delete your own comments' });
    }

    await db.delete(comments).where(eq(comments.id, id));
    return c.json({ data: { id, deleted: true } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'Failed to delete comment' });
  }
});
