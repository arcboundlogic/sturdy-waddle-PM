// Common/shared types used across the platform

export type UUID = string;
export type ISOTimestamp = string;

/** Pagination cursor for Relay-style pagination */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

/** Generic paginated response wrapper */
export interface PaginatedResponse<T> {
  edges: Array<{ node: T; cursor: string }>;
  pageInfo: PageInfo;
  totalCount: number;
}

/** REST API standard error response */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

/** REST API standard success response */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** Tenant tiers */
export type TenantTier = 'solo' | 'team' | 'organization' | 'enterprise';

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Priority levels */
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

/** Work item types */
export type WorkItemType = 'task' | 'story' | 'bug' | 'epic' | 'initiative' | 'subtask';

/** Membership roles */
export type MemberRole = 'owner' | 'admin' | 'member' | 'guest';
