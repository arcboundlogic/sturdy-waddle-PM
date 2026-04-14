import type { MemberRole } from '@waddle/types';

/** All granular permissions in the system */
export const PERMISSIONS = {
  // Workspace
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_MANAGE_MEMBERS: 'workspace:manage_members',
  WORKSPACE_MANAGE_BILLING: 'workspace:manage_billing',

  // Project
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ARCHIVE: 'project:archive',

  // Work Item
  WORK_ITEM_CREATE: 'work_item:create',
  WORK_ITEM_READ: 'work_item:read',
  WORK_ITEM_UPDATE: 'work_item:update',
  WORK_ITEM_DELETE: 'work_item:delete',
  WORK_ITEM_ASSIGN: 'work_item:assign',

  // Comment
  COMMENT_CREATE: 'comment:create',
  COMMENT_READ: 'comment:read',
  COMMENT_UPDATE_OWN: 'comment:update_own',
  COMMENT_DELETE_ANY: 'comment:delete_any',

  // Workflow
  WORKFLOW_CREATE: 'workflow:create',
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_DELETE: 'workflow:delete',

  // Admin
  AUDIT_LOG_READ: 'audit_log:read',
  INTEGRATION_MANAGE: 'integration:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Check if a user's role grants a specific permission.
 */
export function hasPermission(
  role: MemberRole,
  permission: Permission,
  rolePermissions: Record<MemberRole, readonly Permission[]>,
): boolean {
  const perms = rolePermissions[role];
  return perms?.includes(permission) ?? false;
}
