import { pgTable, uuid, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';

/** In-app notifications */
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: varchar('body', { length: 2000 }),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
