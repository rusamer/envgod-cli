import { Command } from 'commander';
import { setRuntimeKey } from '../lib/store';

interface AddKeyOptions {
  org: string;
  project: string;
  env: string;
  service: string;
  key: string;
}

async function handleAddKey(options: AddKeyOptions) {
  const { org, project, env, service, key } = options;
  if (!key || !/^envgod_sk_/.test(key)) {
    console.error('Invalid or missing key. Expected format envgod_sk_...');
    process.exitCode = 2;
    return;
  }
  try {
    await setRuntimeKey({ orgId: org, projectId: project, envId: env, serviceId: service }, key);
    console.log('Runtime key stored for the specified scope.');
  } catch (e) {
    console.error('Failed to store runtime key.');
    process.exitCode = 1;
  }
}

export const addKeyCommand = new Command('add-runtime-key')
  .description('Store a runtime key locally for a specific scope')
  .requiredOption('--org <orgId>', 'Organization ID')
  .requiredOption('--project <projectId>', 'Project ID or name')
  .requiredOption('--env <envId>', 'Environment ID or name')
  .requiredOption('--service <serviceId>', 'Service ID or name')
  .requiredOption('--key <envgod_sk_...>', 'Runtime API key to store')
  .action(handleAddKey);
