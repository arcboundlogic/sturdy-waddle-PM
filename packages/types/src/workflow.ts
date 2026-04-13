import type { UUID, ISOTimestamp } from './common';

/** Workflow — defines the status pipeline for a project */
export interface Workflow {
  id: UUID;
  workspaceId: UUID;
  name: string;
  description?: string;
  isDefault: boolean;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/** Status within a workflow */
export interface WorkflowStatus {
  id: UUID;
  workflowId: UUID;
  name: string;
  color: string;
  category: StatusCategory;
  sortOrder: number;
}

/** High-level category for workflow statuses */
export type StatusCategory = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';

/** Allowed transition between statuses */
export interface WorkflowTransition {
  id: UUID;
  workflowId: UUID;
  fromStatusId: UUID;
  toStatusId: UUID;
}

export interface CreateWorkflowInput {
  name: string;
  description?: string;
  statuses: Array<{
    name: string;
    color: string;
    category: StatusCategory;
    sortOrder: number;
  }>;
}
