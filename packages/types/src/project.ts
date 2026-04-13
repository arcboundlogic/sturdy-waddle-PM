import type { UUID, ISOTimestamp } from './common';

/** Project within a workspace */
export interface Project {
  id: UUID;
  workspaceId: UUID;
  portfolioId?: UUID;
  name: string;
  key: string; // Short prefix for work items, e.g., "BE" → BE-123
  description?: string;
  iconUrl?: string;
  color?: string;
  defaultWorkflowId?: UUID;
  isArchived: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/** Portfolio — groups multiple projects */
export interface Portfolio {
  id: UUID;
  workspaceId: UUID;
  name: string;
  description?: string;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface CreateProjectInput {
  name: string;
  key: string;
  description?: string;
  portfolioId?: UUID;
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  defaultWorkflowId?: UUID;
  isArchived?: boolean;
}
