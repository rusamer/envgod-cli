import { Command } from 'commander';
import { fetchSecretsBundle, Scope } from '../lib/secrets';
import { getRuntimeKey } from '../lib/store';
import { redactBundle, formatDotenv, formatJson, writeFilePrompted, confirmPlainOutput } from '../lib/output';

interface ExportOptions {
  org: string;
  project: string;
  env: string;
  service: string;
  format?: 'dotenv' | 'json';
  redact?: boolean; // default true
  plain?: boolean;  // if true, requires confirmation unless --yes
  out?: string;
  yes?: boolean;    // skip confirms
}

async function handleExport(options: ExportOptions) {
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

  const fmt: 'dotenv' | 'json' = (options.format ?? 'dotenv');
  const redact = options.plain ? false : (options.redact ?? true);

  if (options.plain && !options.yes) {
    try {
      await confirmPlainOutput(false);
    } catch {
      console.error('Aborted.');
      process.exitCode = 1;
      return;
    }
  }

  const outBundle = redactBundle(bundle, redact);
  const content = fmt === 'dotenv' ? formatDotenv(outBundle) : formatJson(outBundle);

  if (options.out) {
    try {
      await writeFilePrompted(options.out, content, !!options.yes);
      console.log(`Wrote ${fmt} to ${options.out}${redact ? ' (redacted)' : ''}`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : 'Failed to write file');
      process.exitCode = 1;
    }
  } else {
    process.stdout.write(content);
  }
}

export const exportCommand = new Command('export')
  .description('Export secrets to STDOUT or a file (redacted by default).')
  .requiredOption('--org <orgId>', 'Organization ID')
  .requiredOption('--project <projectId>', 'Project ID or name')
  .requiredOption('--env <envId>', 'Environment ID or name')
  .requiredOption('--service <serviceId>', 'Service ID or name')
  .option('--format <format>', 'dotenv or json', 'dotenv')
  .option('--redact', 'Redact values (default true)', true)
  .option('--plain', 'Output real values (requires confirmation unless --yes)', false)
  .option('--out <path>', 'Write output to file')
  .option('--yes', 'Skip confirmation prompts (dangerous with --plain)', false)
  .action(handleExport);
