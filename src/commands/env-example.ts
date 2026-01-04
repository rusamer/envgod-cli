import { Command } from 'commander';
import { fetchSecretsBundle, Scope } from '../lib/secrets';
import { getRuntimeKey } from '../lib/store';
import { formatDotenv, writeFilePrompted } from '../lib/output';

interface EnvExampleOptions {
  org: string;
  project: string;
  env: string;
  service: string;
  out?: string;
}

async function handleEnvExample(options: EnvExampleOptions) {
  const scope: Scope = {
    orgId: options.org,
    projectId: options.project,
    envId: options.env,
    serviceId: options.service,
  };

  const runtimeKey = await getRuntimeKey(scope);
  if (!runtimeKey) {
    console.error('No runtime key found for this scope.');
    console.error('Request one with: envguards request-runtime-key --org <orgId> --project <projectId> --env <envId> --service <serviceId> --reason "<reason>"');
    process.exitCode = 1;
    return;
  }

  let bundle: Record<string, string>;
  try {
    bundle = await fetchSecretsBundle(runtimeKey, scope);
  } catch {
    console.error('Failed to fetch secrets bundle.');
    process.exitCode = 1;
    return;
  }

  // Produce keys only with empty values
  const keysOnly: Record<string, string> = {};
  for (const k of Object.keys(bundle)) keysOnly[k] = '';
  const content = formatDotenv(keysOnly);

  if (options.out) {
    try {
      await writeFilePrompted(options.out, content, true);
      console.log(`Wrote .env.example to ${options.out}`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : 'Failed to write file');
      process.exitCode = 1;
    }
  } else {
    process.stdout.write(content);
  }
}

export const envExampleCommand = new Command('env-example')
  .description('Generate .env.example (keys only, no values).')
  .requiredOption('--org <orgId>', 'Organization ID')
  .requiredOption('--project <projectId>', 'Project ID or name')
  .requiredOption('--env <envId>', 'Environment ID or name')
  .requiredOption('--service <serviceId>', 'Service ID or name')
  .option('--out <path>', 'Write output to file (defaults to STDOUT)')
  .action(handleEnvExample);
