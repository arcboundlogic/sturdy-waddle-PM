import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { users } from './users';

/** Activity entity type enum */
export const activityEntityTypeEnum = pgEnum('activity_entity_type', [
  'work_item',
  'project',
  'workflow',
  'workspace',
  'member',
  'comment',
]);

/** Activity log — immutable audit trail */
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => users.id),
  entityType: activityEntityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  changes: jsonb('changes'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
});
