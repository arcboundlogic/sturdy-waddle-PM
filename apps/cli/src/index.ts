#!/usr/bin/env node
import { Command } from 'commander';
import { registerItemCommands } from './commands/item.js';
import { registerSprintCommands } from './commands/sprint.js';
import { registerAiCommands } from './commands/ai.js';

const program = new Command();

program
  .name('waddle')
  .description('Waddle PM CLI — manage your projects from the terminal')
  .version('0.1.0');

registerItemCommands(program);
registerSprintCommands(program);
registerAiCommands(program);

program.parse(process.argv);
