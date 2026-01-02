#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .version('0.1.0')
  .description('EnvGod CLI');

import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { whoamiCommand } from './commands/whoami';
import { orgsCommand } from './commands/orgs';
import { projectsCommand } from './commands/projects';
import { requestCommand } from './commands/request';
import { statusCommand } from './commands/status';

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(orgsCommand);
program.addCommand(projectsCommand);
program.addCommand(requestCommand);
program.addCommand(statusCommand);

program.parse(process.argv);
