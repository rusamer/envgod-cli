import { Command } from 'commander';
import { apiFetch } from '../lib/api';

interface RequestOptions {
  org: string;
  project: string;
  env: string;
  service: string;
  reason?: string;
}

async function handleRequest(options: RequestOptions) {
  try {
    const body = {
      orgId: options.org,
      projectId: options.project,
      envId: options.env,
      serviceId: options.service,
      reason: options.reason,
    };

    await apiFetch('/cp/access-requests', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    console.log('Access request submitted successfully.');
  } catch (error) {
    if (error instanceof Error) {
        console.error(`Failed to submit access request: ${error.message}`);
    } else {
        console.error('An unknown error occurred.');
    }
  }
}

export const requestCommand = new Command('request-runtime-key')
  .description('Request a runtime key for a specific scope')
  .requiredOption('--org <orgId>', 'Organization ID')
  .requiredOption('--project <projectId>', 'Project ID or name')
  .requiredOption('--env <envId>', 'Environment ID or name')
  .requiredOption('--service <serviceId>', 'Service ID or name')
  .option('--reason <reason>', 'Reason for the request')
  .action(handleRequest);
