import { pgTable, uuid, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { projects } from './projects';

/** Automations — configurable workflow rules */
export const automations = pgTable('automations', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  /** Trigger: { type: 'status_changed'|'assigned'|'due_date_approaching', conditions: {} } */
  trigger: jsonb('trigger').notNull(),
  /** Actions: array of { type: 'auto_assign'|'add_label'|'transition_status'|'post_comment', params: {} } */
  actions: jsonb('actions').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
