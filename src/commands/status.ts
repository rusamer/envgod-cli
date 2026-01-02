import { Command } from 'commander';
import { apiFetch } from '../lib/api';
import { getTokens } from '../lib/store';

interface HealthStatus {
  status: string;
  version: string;
}

async function handleStatus() {
  console.log('Checking local authentication status...');
  const tokens = await getTokens();
  if (tokens) {
    console.log('  ✓ Logged in');
  } else {
    console.log('  ✗ Not logged in');
  }

  console.log('\nChecking backend service status...');
  try {
    // The root endpoint in app.ts provides a health check
    const health = await apiFetch('/') as HealthStatus;
    if (health.status === 'healthy') {
      console.log(`  ✓ Backend is healthy (version: ${health.version})`);
    } else {
      console.log(`  ✗ Backend is reporting an unhealthy status: ${health.status}`);
    }
  } catch (error) {
    console.log('  ✗ Failed to connect to the backend.');
    if (error instanceof Error) {
        console.error(`    Error: ${error.message}`);
    }
  }
}

export const statusCommand = new Command('status')
  .description('Check local auth status and backend connectivity')
  .action(handleStatus);
