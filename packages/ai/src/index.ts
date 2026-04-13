/**
 * @waddle/ai — AI Copilot SDK & Prompt Library
 *
 * This package will contain:
 * - Prompt templates for task decomposition, prioritization, and risk analysis
 * - LLM client abstraction (OpenAI, Ollama, etc.)
 * - Embedding generation for semantic search
 * - Structured output parsers
 */

export const AI_PACKAGE_VERSION = '0.1.0';

/** Placeholder for future AI copilot capabilities */
export interface CopilotConfig {
  provider: 'openai' | 'ollama' | 'anthropic';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}
