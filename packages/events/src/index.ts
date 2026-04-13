/**
 * @waddle/events — Event Bus Client (Kafka Producer/Consumer)
 *
 * This package will contain:
 * - Event type definitions for all domain events
 * - Kafka/Redpanda producer & consumer abstractions
 * - Event serialization/deserialization
 * - Dead letter queue handling
 */

export const EVENTS_PACKAGE_VERSION = '0.1.0';

/** All domain event types in the system */
export type DomainEventType =
  | 'work_item.created'
  | 'work_item.updated'
  | 'work_item.deleted'
  | 'work_item.status_changed'
  | 'work_item.assigned'
  | 'project.created'
  | 'project.updated'
  | 'project.archived'
  | 'comment.created'
  | 'comment.updated'
  | 'member.invited'
  | 'member.joined'
  | 'member.removed'
  | 'sprint.started'
  | 'sprint.completed';

/** Base domain event structure */
export interface DomainEvent<T = unknown> {
  id: string;
  type: DomainEventType;
  timestamp: string;
  workspaceId: string;
  actorId: string;
  payload: T;
  metadata?: Record<string, unknown>;
}
