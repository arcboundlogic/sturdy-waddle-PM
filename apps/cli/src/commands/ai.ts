import { Command } from 'commander';
import { apiRequest, printJson } from '../lib/api.js';

export function registerAiCommands(program: Command): void {
  const ai = program.command('ai').description('AI Copilot commands');

  ai
    .command('draft <description>')
    .description('Draft a structured work item from a plain-text description')
    .action(async (description) => {
      console.log('🤖 Drafting work item...');
      const data = await apiRequest('POST', '/ai/draft-item', { description });
      console.log('\n📋 Draft work item:');
      printJson(data);
    });

  ai
    .command('ask <question>')
    .description('Ask a question about your project')
    .requiredOption('--project <projectId>', 'Project ID to query')
    .action(async (question, opts) => {
      console.log('🤖 Thinking...');
      const data = await apiRequest<{ answer: string }>('POST', '/ai/ask', {
        question,
        projectId: opts.project,
      });
      console.log('\n💬 Answer:');
      console.log((data as { answer: string }).answer);
    });

  ai
    .command('risks')
    .description('Identify at-risk work items in a project')
    .requiredOption('--project <projectId>', 'Project ID')
    .option('--sprint <sprintId>', 'Filter by sprint')
    .action(async (opts) => {
      console.log('🤖 Analyzing risks...');
      const data = await apiRequest<unknown[]>('POST', '/ai/risk-radar', {
        projectId: opts.project,
        sprintId: opts.sprint,
      });

      if ((data as unknown[]).length === 0) {
        console.log('✅ No risks identified.');
        return;
      }

      console.log('\n⚠️  At-risk items:');
      printJson(data);
    });
}
