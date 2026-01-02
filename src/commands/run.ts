import { Command } from 'commander';
import { fetchSecretsBundle, Scope } from '../lib/secrets';
import { getRuntimeKey } from '../lib/store';
import { mergeEnvs, spawnWithEnv } from '../lib/spawn';

interface RunOptions {
  org: string;
  project: string;
  env: string;
  service: string;
  override?: boolean;
  redact?: boolean;
  printKeys?: boolean;
}

async function handleRun(cmds: string[], options: RunOptions) {
  if (!cmds || cmds.length === 0) {
    console.error('Missing command to run. Usage: envgod run --org <orgId> --project <projectId> --env <envId> --service <serviceId> -- <command...>');
    process.exitCode = 2;
    return;
  }

  const scope: Scope = {
    orgId: options.org,
    projectId: options.project,
    envId: options.env,
    serviceId: options.service,
  };

  const runtimeKey = await getRuntimeKey(scope);
  if (!runtimeKey) {
    console.error('No runtime key found for this scope.');
    console.error('Request one with: envgod request-runtime-key --org <orgId> --project <projectId> --env <envId> --service <serviceId> --reason "<reason>"');
    process.exitCode = 1;
    return;
  }

  let bundle: Record<string, string>;
  try {
    bundle = await fetchSecretsBundle(runtimeKey, scope);
  } catch (err) {
    console.error('Failed to fetch secrets bundle.');
    process.exitCode = 1;
    return;
  }

  if (options.printKeys) {
    const keys = Object.keys(bundle).sort();
    for (const k of keys) console.log(k);
  }

  const envMerged = mergeEnvs(process.env, bundle, !!options.override);

  const command = cmds[0];
  const args = cmds.slice(1);
  try {
    const code = await spawnWithEnv(command, args, envMerged);
    process.exitCode = code;
  } catch (err) {
    console.error('Failed to spawn process.');
    process.exitCode = 1;
  }
}

export const runCommand = new Command('run')
  .description('Run a command with secrets injected into the environment (no files written).')
  .requiredOption('--org <orgId>', 'Organization ID')
  .requiredOption('--project <projectId>', 'Project ID or name')
  .requiredOption('--env <envId>', 'Environment ID or name')
  .requiredOption('--service <serviceId>', 'Service ID or name')
  .option('--override', 'Allow overwriting existing env vars', false)
  .option('--redact', 'Enable redaction (reserved flag, defaults to true)', true)
  .option('--print-keys', 'Print keys only (never values)', false)
  .argument('<cmd...>', 'Command to execute')
  .action(handleRun);
