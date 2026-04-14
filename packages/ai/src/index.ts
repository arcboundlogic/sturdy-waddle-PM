/**
 * @waddle/ai — AI Copilot SDK & Prompt Library
 */

export const AI_PACKAGE_VERSION = '0.1.0';

/** Configuration for the AI copilot */
export interface CopilotConfig {
  provider: 'openai' | 'ollama' | 'anthropic';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface DraftWorkItemResult {
  title: string;
  description: string;
  type: 'task' | 'story' | 'bug' | 'epic' | 'initiative' | 'subtask';
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  labels: string[];
}

export interface SprintSuggestion {
  workItemId: string;
  title: string;
  reason: string;
  estimatedPoints?: number;
}

export interface RiskAssessment {
  workItemId: string;
  title: string;
  riskLevel: 'high' | 'medium' | 'low';
  reasons: string[];
}

export interface WorkItemSummary {
  id: string;
  title: string;
  assigneeId?: string;
  dueDate?: string;
  priority: string;
  type: string;
  estimatePoints?: number;
  labels?: string[];
}

export interface ProjectContext {
  projectId: string;
  workItems: WorkItemSummary[];
  recentActivity?: Array<{ action: string; timestamp: string; entityId: string }>;
  comments?: Array<{ body: string; workItemId: string }>;
}

export interface SprintPlanningParams {
  projectId: string;
  velocityTarget?: number;
  backlogItems: WorkItemSummary[];
  previousSprintVelocity?: number;
}

/** Simple OpenAI API wrapper */
async function callOpenAI(
  config: CopilotConfig,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const apiKey = config.apiKey ?? process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model ?? 'gpt-4o-mini',
      messages,
      max_tokens: config.maxTokens ?? 1024,
      temperature: config.temperature ?? 0.3,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0]?.message?.content ?? '';
}

/**
 * WaddleAI — AI Copilot for the Sturdy Waddle PM platform.
 */
export class WaddleAI {
  constructor(private config: CopilotConfig) {}

  /**
   * Draft a structured work item from a plain-text description.
   */
  async draftWorkItem(description: string): Promise<DraftWorkItemResult> {
    const prompt = `You are a project management assistant. Given the following description, produce a structured work item as JSON.

Description: ${description}

Respond with ONLY valid JSON matching this schema:
{
  "title": string (concise, max 100 chars),
  "description": string (detailed markdown),
  "type": "task" | "story" | "bug" | "epic" | "initiative" | "subtask",
  "priority": "urgent" | "high" | "medium" | "low" | "none",
  "labels": string[]
}`;

    const raw = await callOpenAI(this.config, [
      { role: 'system', content: 'You are a helpful project management assistant. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ]);

    try {
      const jsonStr = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(jsonStr) as DraftWorkItemResult;
    } catch {
      return {
        title: description.slice(0, 100),
        description,
        type: 'task',
        priority: 'none',
        labels: [],
      };
    }
  }

  /**
   * Suggest which backlog items to include in a sprint based on velocity and priorities.
   */
  async suggestSprintItems(params: SprintPlanningParams): Promise<SprintSuggestion[]> {
    const itemsSummary = params.backlogItems
      .slice(0, 50)
      .map((i) => `- [${i.id}] ${i.title} (${i.priority}, ${i.estimatePoints ?? '?'}pts)`)
      .join('\n');

    const prompt = `You are a sprint planning assistant. Select items for a sprint.

Velocity target: ${params.velocityTarget ?? 'unknown'} points
Previous sprint velocity: ${params.previousSprintVelocity ?? 'unknown'} points

Backlog items:
${itemsSummary}

Return a JSON array of suggestions:
[{ "workItemId": string, "title": string, "reason": string, "estimatedPoints": number }]

Prioritize: high priority items, items with clear scope, avoid items that are too large.`;

    const raw = await callOpenAI(this.config, [
      { role: 'system', content: 'You are a helpful sprint planning assistant. Respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ]);

    try {
      const jsonStr = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(jsonStr) as SprintSuggestion[];
    } catch {
      return [];
    }
  }

  /**
   * Identify work items at risk (no assignee, approaching due date, etc.).
   */
  async analyzeRisks(workItems: WorkItemSummary[]): Promise<RiskAssessment[]> {
    const now = new Date();
    const risks: RiskAssessment[] = [];

    for (const item of workItems) {
      const reasons: string[] = [];

      if (!item.assigneeId) {
        reasons.push('No assignee');
      }

      if (item.dueDate) {
        const due = new Date(item.dueDate);
        const daysUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (daysUntilDue < 0) {
          reasons.push('Overdue');
        } else if (daysUntilDue < 3) {
          reasons.push(`Due in ${Math.ceil(daysUntilDue)} day(s)`);
        }
      }

      if (item.priority === 'urgent' && !item.assigneeId) {
        reasons.push('Urgent but unassigned');
      }

      if (reasons.length > 0) {
        risks.push({
          workItemId: item.id,
          title: item.title,
          riskLevel: reasons.some((r) => r.includes('Overdue') || r.includes('Urgent')) ? 'high' : 'medium',
          reasons,
        });
      }
    }

    return risks;
  }

  /**
   * Answer a natural language question about a project using context from work items.
   */
  async answerQuestion(question: string, context: ProjectContext): Promise<string> {
    const itemsContext = context.workItems
      .slice(0, 30)
      .map((i) => `- ${i.title} (${i.type}, ${i.priority}, assignee: ${i.assigneeId ?? 'none'})`)
      .join('\n');

    const activityContext = (context.recentActivity ?? [])
      .slice(0, 10)
      .map((a) => `- ${a.action} on ${a.entityId} at ${a.timestamp}`)
      .join('\n');

    const prompt = `You are a project management assistant. Answer the user's question about their project.

Work items:
${itemsContext}

Recent activity:
${activityContext || 'None'}

Question: ${question}

Provide a clear, concise answer based on the context above.`;

    return callOpenAI(this.config, [
      { role: 'system', content: 'You are a helpful project management assistant.' },
      { role: 'user', content: prompt },
    ]);
  }
}
