import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  jsonb,
  real,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { projects } from './projects';
import { users } from './users';
import { workflowStatuses } from './workflows';
import { sprints } from './sprints';

/** Work item type enum */
export const workItemTypeEnum = pgEnum('work_item_type', [
  'task',
  'story',
  'bug',
  'epic',
  'initiative',
  'subtask',
]);

/** Priority enum */
export const priorityEnum = pgEnum('priority', ['urgent', 'high', 'medium', 'low', 'none']);

/** Relation type enum */
export const relationTypeEnum = pgEnum('relation_type', [
  'blocks',
  'is_blocked_by',
  'relates_to',
  'duplicates',
  'is_duplicated_by',
  'parent_of',
  'child_of',
]);

/** Work items — tasks, stories, bugs, epics, etc. */
export const workItems = pgTable('work_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // Self-reference for hierarchy
  workflowStatusId: uuid('workflow_status_id')
    .notNull()
    .references(() => workflowStatuses.id),
  type: workItemTypeEnum('type').notNull().default('task'),
  number: integer('number').notNull(), // Auto-increment per project
  title: varchar('title', { length: 500 }).notNull(),
  description: varchar('description', { length: 50000 }),
  priority: priorityEnum('priority').notNull().default('none'),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  reporterId: uuid('reporter_id').references(() => users.id, { onDelete: 'set null' }),
  sprintId: uuid('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  estimatePoints: real('estimate_points'),
  labels: jsonb('labels').notNull().default([]),
  customFields: jsonb('custom_fields').notNull().default({}),
  sortOrder: real('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Work item relations — dependency and relationship links */
export const workItemRelations = pgTable('work_item_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceItemId: uuid('source_item_id')
    .notNull()
    .references(() => workItems.id, { onDelete: 'cascade' }),
  targetItemId: uuid('target_item_id')
    .notNull()
    .references(() => workItems.id, { onDelete: 'cascade' }),
  relationType: relationTypeEnum('relation_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Labels for categorizing work items */
export const labels = pgTable('labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  description: varchar('description', { length: 500 }),
});
