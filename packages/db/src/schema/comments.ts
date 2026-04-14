import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { workItems } from './work-items';
import { users } from './users';

/** Comments on work items (threaded) */
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  workItemId: uuid('work_item_id')
    .notNull()
    .references(() => workItems.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id'), // Self-reference for threads
  body: varchar('body', { length: 50000 }).notNull(),
  isEdited: boolean('is_edited').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Attachments on work items */
export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  workItemId: uuid('work_item_id')
    .notNull()
    .references(() => workItems.id, { onDelete: 'cascade' }),
  uploaderId: uuid('uploader_id')
    .notNull()
    .references(() => users.id),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileSize: varchar('file_size', { length: 20 }).notNull(), // bytes as string for large files
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 1024 }).notNull(), // S3 key
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
