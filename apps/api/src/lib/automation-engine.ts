import type { Database } from '@waddle/db';
import { automations, workItems, comments, activityLog, notifications } from '@waddle/db';
import { eq, and } from 'drizzle-orm';

interface AutomationTrigger {
  type: 'status_changed' | 'assigned' | 'due_date_approaching' | 'created';
  conditions?: Record<string, unknown>;
}

interface AutomationAction {
  type: 'auto_assign' | 'add_label' | 'transition_status' | 'post_comment' | 'send_notification';
  params: Record<string, unknown>;
}

export interface AutomationEvent {
  type: string;
  workspaceId: string;
  projectId?: string;
  actorId?: string;
  payload: {
    workItemId?: string;
    fromStatusId?: string;
    toStatusId?: string;
    assigneeId?: string;
    [key: string]: unknown;
  };
}

/** Evaluate whether a trigger matches the event */
function matchesTrigger(trigger: AutomationTrigger, event: AutomationEvent): boolean {
  if (trigger.type !== event.type) return false;

  const conditions = trigger.conditions ?? {};

  // Check any condition key against the event payload
  for (const [key, expected] of Object.entries(conditions)) {
    const actual = event.payload[key];
    if (actual !== expected) return false;
  }

  return true;
}

/** Execute a single automation action */
async function executeAction(
  action: AutomationAction,
  event: AutomationEvent,
  db: Database,
): Promise<void> {
  const { workItemId } = event.payload;
  if (!workItemId) return;

  switch (action.type) {
    case 'auto_assign': {
      const assigneeId = action.params['assigneeId'] as string | undefined;
      if (assigneeId) {
        await db
          .update(workItems)
          .set({ assigneeId, updatedAt: new Date() })
          .where(eq(workItems.id, workItemId));
      }
      break;
    }

    case 'add_label': {
      const label = action.params['label'] as string | undefined;
      if (label) {
        const [item] = await db.select().from(workItems).where(eq(workItems.id, workItemId)).limit(1);
        if (item) {
          const existingLabels = (item.labels as string[]) ?? [];
          if (!existingLabels.includes(label)) {
            await db
              .update(workItems)
              .set({ labels: [...existingLabels, label], updatedAt: new Date() })
              .where(eq(workItems.id, workItemId));
          }
        }
      }
      break;
    }

    case 'transition_status': {
      const toStatusId = action.params['toStatusId'] as string | undefined;
      if (toStatusId) {
        await db
          .update(workItems)
          .set({ workflowStatusId: toStatusId, updatedAt: new Date() })
          .where(eq(workItems.id, workItemId));
      }
      break;
    }

    case 'post_comment': {
      const body = action.params['body'] as string | undefined;
      const authorId = action.params['authorId'] as string | undefined;
      if (body && authorId) {
        await db.insert(comments).values({
          workItemId,
          authorId,
          body,
        });
      }
      break;
    }

    case 'send_notification': {
      const userId = action.params['userId'] as string | undefined;
      const title = (action.params['title'] as string) ?? 'Automation triggered';
      const notifBody = action.params['body'] as string | undefined;
      if (userId) {
        await db.insert(notifications).values({
          workspaceId: event.workspaceId,
          userId,
          type: 'automation_fired',
          title,
          body: notifBody,
          entityType: 'work_item',
          entityId: workItemId,
        });
      }
      break;
    }
  }
}

/**
 * Evaluate all automations for the given event and execute matching ones.
 */
export async function evaluateAutomations(
  event: AutomationEvent,
  database: Database,
): Promise<void> {
  try {
    const conditions = [
      eq(automations.workspaceId, event.workspaceId),
      eq(automations.isEnabled, true),
    ];

    const rules = await database.select().from(automations).where(and(...conditions));

    for (const rule of rules) {
      // Filter by project if rule is project-specific
      if (rule.projectId && rule.projectId !== event.projectId) continue;

      const trigger = rule.trigger as AutomationTrigger;
      if (!matchesTrigger(trigger, event)) continue;

      const actions = (rule.actions as AutomationAction[]) ?? [];
      for (const action of actions) {
        await executeAction(action, event, database).catch((err) => {
          console.error(`[automation-engine] action ${action.type} failed:`, err);
        });
      }
    }
  } catch (err) {
    console.error('[automation-engine] evaluation failed:', err);
  }
}
