import type { UUID, ISOTimestamp, Priority, WorkItemType } from './common';

/** Work item — tasks, stories, bugs, epics, etc. */
export interface WorkItem {
  id: UUID;
  workspaceId: UUID;
  projectId: UUID;
  parentId?: UUID;
  workflowStatusId: UUID;
  type: WorkItemType;
  number: number; // Auto-incrementing per project
  title: string;
  description?: string;
  priority: Priority;
  assigneeId?: UUID;
  reporterId?: UUID;
  sprintId?: UUID;
  dueDate?: ISOTimestamp;
  estimatePoints?: number;
  labels: string[];
  customFields: Record<string, unknown>;
  sortOrder: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/** Work item relation types */
export type RelationType =
  | 'blocks'
  | 'is-blocked-by'
  | 'relates-to'
  | 'duplicates'
  | 'is-duplicated-by'
  | 'parent-of'
  | 'child-of';

/** Relation between two work items */
export interface WorkItemRelation {
  id: UUID;
  sourceItemId: UUID;
  targetItemId: UUID;
  relationType: RelationType;
  createdAt: ISOTimestamp;
}

/** Sprint / Iteration */
export interface Sprint {
  id: UUID;
  projectId: UUID;
  name: string;
  goal?: string;
  startDate: ISOTimestamp;
  endDate: ISOTimestamp;
  status: 'planning' | 'active' | 'completed';
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/** Label for categorizing work items */
export interface Label {
  id: UUID;
  workspaceId: UUID;
  name: string;
  color: string;
  description?: string;
}

export interface CreateWorkItemInput {
  projectId: UUID;
  type: WorkItemType;
  title: string;
  description?: string;
  priority?: Priority;
  assigneeId?: UUID;
  parentId?: UUID;
  sprintId?: UUID;
  dueDate?: ISOTimestamp;
  estimatePoints?: number;
  labels?: string[];
  customFields?: Record<string, unknown>;
}

export interface UpdateWorkItemInput {
  title?: string;
  description?: string;
  priority?: Priority;
  assigneeId?: UUID | null;
  workflowStatusId?: UUID;
  sprintId?: UUID | null;
  dueDate?: ISOTimestamp | null;
  estimatePoints?: number | null;
  labels?: string[];
  customFields?: Record<string, unknown>;
  sortOrder?: number;
}
