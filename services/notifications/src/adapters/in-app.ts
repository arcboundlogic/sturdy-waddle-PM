import { db, notifications } from '@waddle/db';
import { eq, and } from 'drizzle-orm';

export interface NotificationPayload {
  workspaceId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
}

/** Store a notification in the database */
export async function createInAppNotification(payload: NotificationPayload): Promise<void> {
  await db.insert(notifications).values({
    workspaceId: payload.workspaceId,
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    entityType: payload.entityType,
    entityId: payload.entityId,
  });
}

/** Mark a notification as read */
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

/** Get unread notifications for a user */
export async function getUserNotifications(userId: string, limit = 50) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .limit(limit);
}
