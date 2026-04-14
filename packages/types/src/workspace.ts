import type { UUID, ISOTimestamp, TenantTier } from './common';

/** Workspace (tenant) — the top-level organizational unit */
export interface Workspace {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  tier: TenantTier;
  logoUrl?: string;
  settings: WorkspaceSettings;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface WorkspaceSettings {
  defaultProjectWorkflowId?: UUID;
  allowGuestAccess: boolean;
  requireMfa: boolean;
  dataRegion?: 'us' | 'eu' | 'apac';
}

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  description?: string;
  tier?: TenantTier;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  logoUrl?: string;
  settings?: Partial<WorkspaceSettings>;
}
