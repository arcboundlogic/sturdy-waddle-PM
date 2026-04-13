import type { UUID, ISOTimestamp, MemberRole } from './common';

/** User account */
export interface User {
  id: UUID;
  email: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/** Workspace membership — links a user to a workspace with a role */
export interface WorkspaceMember {
  id: UUID;
  userId: UUID;
  workspaceId: UUID;
  role: MemberRole;
  joinedAt: ISOTimestamp;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  avatarUrl?: string;
}

export interface InviteMemberInput {
  email: string;
  role: MemberRole;
}
