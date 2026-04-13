import type { UUID, ISOTimestamp } from './common';

/** Comment on a work item (threaded) */
export interface Comment {
  id: UUID;
  workItemId: UUID;
  authorId: UUID;
  parentCommentId?: UUID;
  body: string;
  reactions: Record<string, UUID[]>; // emoji → userId[]
  isEdited: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface CreateCommentInput {
  workItemId: UUID;
  body: string;
  parentCommentId?: UUID;
}

export interface UpdateCommentInput {
  body: string;
}

/** Activity log entry for audit trail */
export interface ActivityEntry {
  id: UUID;
  workspaceId: UUID;
  actorId: UUID;
  entityType: 'work_item' | 'project' | 'workflow' | 'workspace' | 'member' | 'comment';
  entityId: UUID;
  action: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  timestamp: ISOTimestamp;
}
