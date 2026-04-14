import { pgTable, uuid, varchar, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';

/** Status category enum */
export const statusCategoryEnum = pgEnum('status_category', [
  'backlog',
  'todo',
  'in_progress',
  'done',
  'cancelled',
]);

/** Workflows — define the status pipeline for a project */
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 2000 }),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Workflow statuses — individual statuses within a workflow */
export const workflowStatuses = pgTable('workflow_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(), // hex color
  category: statusCategoryEnum('category').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

/** Workflow transitions — allowed status-to-status moves */
export const workflowTransitions = pgTable('workflow_transitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id')
    .notNull()
    .references(() => workflows.id, { onDelete: 'cascade' }),
  fromStatusId: uuid('from_status_id')
    .notNull()
    .references(() => workflowStatuses.id, { onDelete: 'cascade' }),
  toStatusId: uuid('to_status_id')
    .notNull()
    .references(() => workflowStatuses.id, { onDelete: 'cascade' }),
});
