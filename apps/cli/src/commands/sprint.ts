import { Command } from 'commander';
import { apiRequest, printJson, printTable } from '../lib/api.js';

export function registerSprintCommands(program: Command): void {
  const sprint = program.command('sprint').description('Manage sprints');

  sprint
    .command('list')
    .description('List sprints')
    .option('--project <projectId>', 'Filter by project ID')
    .action(async (opts) => {
      const params = new URLSearchParams();
      if (opts.project) params.set('projectId', opts.project);

      const data = await apiRequest<unknown[]>('GET', `/sprints?${params}`);
      printTable(data as Record<string, unknown>[], ['id', 'name', 'status', 'startDate', 'endDate']);
    });

  sprint
    .command('start <id>')
    .description('Start a sprint (set status to active)')
    .action(async (id) => {
      const data = await apiRequest('PATCH', `/sprints/${id}`, { status: 'active' });
      console.log('🏃 Sprint started:');
      printJson(data);
    });

  sprint
    .command('complete <id>')
    .description('Complete a sprint')
    .action(async (id) => {
      const data = await apiRequest('POST', `/sprints/${id}/complete`, {});
      console.log('✅ Sprint completed:');
      printJson(data);
    });

  sprint
    .command('create')
    .description('Create a new sprint')
    .requiredOption('--project <projectId>', 'Project ID')
    .requiredOption('--name <name>', 'Sprint name')
    .requiredOption('--start <date>', 'Start date (ISO)')
    .requiredOption('--end <date>', 'End date (ISO)')
    .option('--goal <goal>', 'Sprint goal')
    .action(async (opts) => {
      const data = await apiRequest('POST', '/sprints', {
        projectId: opts.project,
        name: opts.name,
        goal: opts.goal,
        startDate: opts.start,
        endDate: opts.end,
      });
      console.log('✅ Sprint created:');
      printJson(data);
    });
}
