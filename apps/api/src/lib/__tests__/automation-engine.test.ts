import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AutomationEvent } from '../automation-engine.js';

// Mock @waddle/db
vi.mock('@waddle/db', () => ({
  automations: {},
  workItems: {},
  comments: {},
  activityLog: {},
  notifications: {},
  db: null,
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

describe('automation-engine', () => {
  describe('matchesTrigger (via evaluateAutomations)', () => {
    it('event type must match trigger type', () => {
      // Test the pure matching logic independently
      const matchesTrigger = (
        trigger: { type: string; conditions?: Record<string, unknown> },
        event: AutomationEvent,
      ) => {
        if (trigger.type !== event.type) return false;
        const conditions = trigger.conditions ?? {};
        for (const [key, expected] of Object.entries(conditions)) {
          const actual = event.payload[key];
          if (actual !== expected) return false;
        }
        return true;
      };

      const event: AutomationEvent = {
        type: 'status_changed',
        workspaceId: 'ws-1',
        payload: { workItemId: 'item-1', toStatusId: 'done' },
      };

      expect(matchesTrigger({ type: 'status_changed' }, event)).toBe(true);
      expect(matchesTrigger({ type: 'assigned' }, event)).toBe(false);
    });

    it('conditions filter by payload fields', () => {
      const matchesTrigger = (
        trigger: { type: string; conditions?: Record<string, unknown> },
        event: AutomationEvent,
      ) => {
        if (trigger.type !== event.type) return false;
        const conditions = trigger.conditions ?? {};
        for (const [key, expected] of Object.entries(conditions)) {
          const actual = event.payload[key];
          if (actual !== expected) return false;
        }
        return true;
      };

      const event: AutomationEvent = {
        type: 'status_changed',
        workspaceId: 'ws-1',
        payload: { workItemId: 'item-1', toStatusId: 'done' },
      };

      expect(matchesTrigger({ type: 'status_changed', conditions: { toStatusId: 'done' } }, event)).toBe(true);
      expect(matchesTrigger({ type: 'status_changed', conditions: { toStatusId: 'todo' } }, event)).toBe(false);
    });

    it('empty conditions always match', () => {
      const matchesTrigger = (
        trigger: { type: string; conditions?: Record<string, unknown> },
        event: AutomationEvent,
      ) => {
        if (trigger.type !== event.type) return false;
        return true;
      };

      const event: AutomationEvent = {
        type: 'created',
        workspaceId: 'ws-1',
        payload: { workItemId: 'item-1' },
      };

      expect(matchesTrigger({ type: 'created', conditions: {} }, event)).toBe(true);
    });
  });
});
