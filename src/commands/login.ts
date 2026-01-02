import { Command } from 'commander';
import { startDeviceFlow } from '../lib/device-flow';

export const loginCommand = new Command('login')
  .description('Log in to EnvGod')
  .action(startDeviceFlow);
