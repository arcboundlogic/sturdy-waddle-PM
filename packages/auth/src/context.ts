import type { UUID, MemberRole } from '@waddle/types';

/** Authenticated user in a request context */
export interface SessionUser {
  id: UUID;
  email: string;
  name: string;
}

/** Full auth context for a request (user + tenant) */
export interface AuthContext {
  user: SessionUser;
  workspaceId: UUID;
  role: MemberRole;
}
