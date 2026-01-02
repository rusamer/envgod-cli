import fs from 'node:fs/promises';

export type Format = 'dotenv' | 'json';

export function redactBundle(bundle: Record<string, string>, redact: boolean): Record<string, string> {
  if (!redact) return { ...bundle };
  const out: Record<string, string> = {};
  for (const k of Object.keys(bundle)) out[k] = '********';
  return out;
}

export function formatDotenv(bundle: Record<string, string>): string {
  const lines: string[] = [];
  const keys = Object.keys(bundle).sort((a, b) => a.localeCompare(b));
  for (const k of keys) {
    const v = bundle[k] ?? '';
    // Quote if contains spaces or special chars
    const needsQuote = /\s|[#'"\\]/.test(v);
    const safe = needsQuote ? JSON.stringify(v) : v;
    lines.push(`${k}=${safe}`);
  }
  return lines.join('\n') + (lines.length ? '\n' : '');
}

export function formatJson(bundle: Record<string, string>): string {
  return JSON.stringify(bundle, null, 2) + '\n';
}

export async function writeFilePrompted(path: string, content: string, force: boolean): Promise<void> {
  if (!force) {
    // Best-effort: if file exists, refuse without force
    try {
      await fs.access(path);
      throw new Error(`Refusing to overwrite existing file: ${path}. Re-run with --yes to confirm.`);
    } catch {
      // doesn't exist — ok
    }
  }
  await fs.writeFile(path, content, { encoding: 'utf8', mode: 0o600 });
}

export async function confirmPlainOutput(nonInteractiveYes: boolean): Promise<void> {
  if (nonInteractiveYes) return;
  const rl = await import('node:readline/promises');
  const { stdin: input, stdout: output } = await import('node:process');
  const rli = rl.createInterface({ input, output });
  try {
    const ans = (await rli.question('WARNING: You are about to output real secret values. Continue? (y/N) ')).trim().toLowerCase();
    if (ans !== 'y' && ans !== 'yes') {
      throw new Error('Aborted by user');
    }
  } finally {
    rli.close();
  }
}
