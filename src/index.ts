#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .version('0.2.0')
  .description('EnvGod CLI');

import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { whoamiCommand } from './commands/whoami';
import { orgsCommand } from './commands/orgs';
import { projectsCommand } from './commands/projects';
import { requestCommand } from './commands/request';
import { statusCommand } from './commands/status';
import { runCommand } from './commands/run';
import { exportCommand } from './commands/export';
import { envExampleCommand } from './commands/env-example';
import { requestsCommand } from './commands/requests';
import { addKeyCommand } from './commands/add-key';

program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(orgsCommand);
program.addCommand(projectsCommand);
program.addCommand(requestCommand);
program.addCommand(statusCommand);
program.addCommand(runCommand);
program.addCommand(exportCommand);
program.addCommand(envExampleCommand);
program.addCommand(requestsCommand);
program.addCommand(addKeyCommand);

program.parse(process.argv);
