import { Command } from 'commander';
import { clearTokens } from '../lib/store';

const handleLogout = async () => {
  await clearTokens();
  console.log('Successfully logged out!');
};

export const logoutCommand = new Command('logout')
  .description('Log out from EnvGod')
  .action(handleLogout);
