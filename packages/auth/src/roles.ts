import type { MemberRole } from '@waddle/types';
import { PERMISSIONS, type Permission } from './permissions';

const P = PERMISSIONS;

/** Default RBAC role → permission mappings */
export const ROLE_PERMISSIONS: Record<MemberRole, readonly Permission[]> = {
  owner: Object.values(P),

  admin: [
    P.WORKSPACE_READ,
    P.WORKSPACE_UPDATE,
    P.WORKSPACE_MANAGE_MEMBERS,
    P.PROJECT_CREATE,
    P.PROJECT_READ,
    P.PROJECT_UPDATE,
    P.PROJECT_DELETE,
    P.PROJECT_ARCHIVE,
    P.WORK_ITEM_CREATE,
    P.WORK_ITEM_READ,
    P.WORK_ITEM_UPDATE,
    P.WORK_ITEM_DELETE,
    P.WORK_ITEM_ASSIGN,
    P.COMMENT_CREATE,
    P.COMMENT_READ,
    P.COMMENT_UPDATE_OWN,
    P.COMMENT_DELETE_ANY,
    P.WORKFLOW_CREATE,
    P.WORKFLOW_READ,
    P.WORKFLOW_UPDATE,
    P.WORKFLOW_DELETE,
    P.AUDIT_LOG_READ,
    P.INTEGRATION_MANAGE,
  ],

  member: [
    P.WORKSPACE_READ,
    P.PROJECT_READ,
    P.PROJECT_CREATE,
    P.WORK_ITEM_CREATE,
    P.WORK_ITEM_READ,
    P.WORK_ITEM_UPDATE,
    P.WORK_ITEM_ASSIGN,
    P.COMMENT_CREATE,
    P.COMMENT_READ,
    P.COMMENT_UPDATE_OWN,
    P.WORKFLOW_READ,
  ],

  guest: [P.WORKSPACE_READ, P.PROJECT_READ, P.WORK_ITEM_READ, P.COMMENT_READ, P.WORKFLOW_READ],
} as const;

export type RolePermissionMap = typeof ROLE_PERMISSIONS;
