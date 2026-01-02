import { Command } from 'commander';
import { apiFetch } from '../lib/api';

interface Org {
  id: string;
  name: string;
}

async function handleOrgs() {
  try {
    const orgs = await apiFetch('/cp/orgs') as Org[];
    if (orgs.length === 0) {
      console.log('You are not a member of any organizations.');
      return;
    }

    console.log('Organizations:');
    orgs.forEach(org => {
      console.log(`  - ${org.name} (ID: ${org.id})`);
    });
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Failed to list organizations: ${error.message}`);
    } else {
        console.error('An unknown error occurred.');
    }
  }
}

export const orgsCommand = new Command('orgs')
  .description('List organizations')
  .action(handleOrgs);
