import { Command } from 'commander';
import { apiFetch } from '../lib/api';
import { getTokens } from '../lib/store';

async function handleWhoami() {
  const tokens = await getTokens();
  if (!tokens) {
    console.log('You are not logged in. Please run `envgod login`.');
    return;
  }

  try {
    // Assuming a /cp/me endpoint exists that returns user info like { id, email }
    const user = await apiFetch('/cp/me') as { id: string, email: string };
    console.log('Logged in as:');
    console.log(`  Email: ${user.email}`);
    console.log(`  User ID: ${user.id}`);
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Failed to get user information: ${error.message}`);
    } else {
        console.error('An unknown error occurred.');
    }
  }
}

export const whoamiCommand = new Command('whoami')
  .description('Show the current user')
  .action(handleWhoami);
