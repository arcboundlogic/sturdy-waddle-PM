import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { createInAppNotification, getUserNotifications, markAsRead } from './adapters/in-app.js';
import { sendEmail } from './adapters/email.js';
import { sendSlackMessage } from './adapters/slack.js';

const app = new Hono();

const sendSchema = z.object({
  channel: z.enum(['in-app', 'email', 'slack']),
  workspaceId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  type: z.string().default('notification'),
  title: z.string().min(1).max(255),
  body: z.string().max(2000).optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  // Email-specific
  to: z.string().email().optional(),
  subject: z.string().optional(),
  html: z.string().optional(),
  // Slack-specific
  webhookUrl: z.string().url().optional(),
});

/** Send a notification via one or more channels */
app.post('/notifications/send', async (c) => {
  const body = await c.req.json();
  const parsed = sendSchema.safeParse(body);

  if (!parsed.success) {
    throw new HTTPException(422, { message: 'Validation failed', cause: parsed.error.flatten() });
  }

  const data = parsed.data;

  try {
    switch (data.channel) {
      case 'in-app':
        if (!data.workspaceId || !data.userId) {
          throw new HTTPException(422, { message: 'workspaceId and userId required for in-app notifications' });
        }
        await createInAppNotification({
          workspaceId: data.workspaceId,
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          entityType: data.entityType,
          entityId: data.entityId,
        });
        break;

      case 'email':
        if (!data.to) {
          throw new HTTPException(422, { message: 'to is required for email notifications' });
        }
        await sendEmail({
          to: data.to,
          subject: data.subject ?? data.title,
          text: data.body ?? data.title,
          html: data.html,
        });
        break;

      case 'slack':
        if (!data.webhookUrl) {
          throw new HTTPException(422, { message: 'webhookUrl is required for Slack notifications' });
        }
        await sendSlackMessage({
          webhookUrl: data.webhookUrl,
          text: `*${data.title}*${data.body ? `\n${data.body}` : ''}`,
        });
        break;
    }

    return c.json({ data: { sent: true, channel: data.channel } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    console.error('[notifications.send]', err);
    throw new HTTPException(500, { message: 'Failed to send notification' });
  }
});

/** Get in-app notifications for a user */
app.get('/notifications', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) throw new HTTPException(400, { message: 'userId query param required' });

  try {
    const items = await getUserNotifications(userId);
    return c.json({ data: items });
  } catch (err) {
    console.error('[notifications.list]', err);
    throw new HTTPException(500, { message: 'Failed to get notifications' });
  }
});

/** Mark a notification as read */
app.patch('/notifications/:id/read', async (c) => {
  const id = c.req.param('id');
  const userId = c.req.query('userId');
  if (!userId) throw new HTTPException(400, { message: 'userId query param required' });

  try {
    await markAsRead(id, userId);
    return c.json({ data: { id, read: true } });
  } catch (err) {
    console.error('[notifications.read]', err);
    throw new HTTPException(500, { message: 'Failed to mark notification as read' });
  }
});

const port = Number(process.env['NOTIFICATIONS_PORT'] ?? 4002);
serve({ fetch: app.fetch, port });
console.log(`📬 Notifications service running on port ${port}`);
