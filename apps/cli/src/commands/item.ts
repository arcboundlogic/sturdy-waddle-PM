import { Command } from 'commander';
import { apiRequest, printJson, printTable } from '../lib/api.js';

export function registerItemCommands(program: Command): void {
  const item = program.command('item').description('Manage work items');

  item
    .command('list')
    .description('List work items')
    .option('--project <projectId>', 'Filter by project ID')
    .option('--sprint <sprintId>', 'Filter by sprint ID')
    .option('--limit <n>', 'Max results', '25')
    .action(async (opts) => {
      const params = new URLSearchParams();
      if (opts.project) params.set('projectId', opts.project);
      if (opts.sprint) params.set('sprintId', opts.sprint);
      params.set('limit', opts.limit);

      const data = await apiRequest<unknown[]>('GET', `/work-items?${params}`);
      printTable(data as Record<string, unknown>[], ['id', 'number', 'title', 'priority', 'type']);
    });

  item
    .command('create')
    .description('Create a new work item')
    .requiredOption('--project <projectId>', 'Project ID')
    .requiredOption('--title <title>', 'Work item title')
    .requiredOption('--status <statusId>', 'Workflow status ID')
    .option('--type <type>', 'Item type', 'task')
    .option('--priority <priority>', 'Priority', 'none')
    .option('--description <desc>', 'Description')
    .action(async (opts) => {
      const data = await apiRequest('POST', '/work-items', {
        projectId: opts.project,
        title: opts.title,
        type: opts.type,
        priority: opts.priority,
        description: opts.description,
        workflowStatusId: opts.status,
      });
      console.log('✅ Work item created:');
      printJson(data);
    });

  item
    .command('update <id>')
    .description('Update a work item')
    .option('--title <title>', 'New title')
    .option('--priority <priority>', 'New priority')
    .option('--assignee <userId>', 'Assign to user')
    .action(async (id, opts) => {
      const updates: Record<string, unknown> = {};
      if (opts.title) updates['title'] = opts.title;
      if (opts.priority) updates['priority'] = opts.priority;
      if (opts.assignee) updates['assigneeId'] = opts.assignee;

      const data = await apiRequest('PATCH', `/work-items/${id}`, updates);
      console.log('✅ Work item updated:');
      printJson(data);
    });

  item
    .command('get <id>')
    .description('Get a work item by ID')
    .action(async (id) => {
      const data = await apiRequest('GET', `/work-items/${id}`);
      printJson(data);
    });
}
