import { describe, it, expect } from 'vitest';
import { PERMISSIONS, hasPermission } from '../permissions.js';
import { ROLE_PERMISSIONS } from '../roles.js';
import type { MemberRole } from '@waddle/types';

describe('hasPermission', () => {
  it('owner has all permissions', () => {
    const allPerms = Object.values(PERMISSIONS);
    for (const perm of allPerms) {
      expect(hasPermission('owner', perm, ROLE_PERMISSIONS)).toBe(true);
    }
  });

  it('guest cannot create work items', () => {
    expect(hasPermission('guest', PERMISSIONS.WORK_ITEM_CREATE, ROLE_PERMISSIONS)).toBe(false);
  });

  it('guest can read work items', () => {
    expect(hasPermission('guest', PERMISSIONS.WORK_ITEM_READ, ROLE_PERMISSIONS)).toBe(true);
  });

  it('member can create and update work items', () => {
    expect(hasPermission('member', PERMISSIONS.WORK_ITEM_CREATE, ROLE_PERMISSIONS)).toBe(true);
    expect(hasPermission('member', PERMISSIONS.WORK_ITEM_UPDATE, ROLE_PERMISSIONS)).toBe(true);
  });

  it('member cannot delete workspace', () => {
    expect(hasPermission('member', PERMISSIONS.WORKSPACE_DELETE, ROLE_PERMISSIONS)).toBe(false);
  });

  it('admin cannot delete workspace', () => {
    expect(hasPermission('admin', PERMISSIONS.WORKSPACE_DELETE, ROLE_PERMISSIONS)).toBe(false);
  });

  it('admin can manage members', () => {
    expect(hasPermission('admin', PERMISSIONS.WORKSPACE_MANAGE_MEMBERS, ROLE_PERMISSIONS)).toBe(true);
  });

  it('returns false for unknown role', () => {
    expect(hasPermission('unknown' as MemberRole, PERMISSIONS.WORKSPACE_READ, ROLE_PERMISSIONS)).toBe(false);
  });
});
