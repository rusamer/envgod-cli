import { spawn } from 'node:child_process';

export function mergeEnvs(base: NodeJS.ProcessEnv, inject: Record<string, string>, override: boolean): NodeJS.ProcessEnv {
  const out: NodeJS.ProcessEnv = { ...base };
  for (const [k, v] of Object.entries(inject)) {
    if (override || out[k] === undefined) {
      out[k] = v;
    }
  }
  return out;
}

export async function spawnWithEnv(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      env,
      shell: process.platform === 'win32',
    });
    child.on('error', (err) => reject(err));
    child.on('exit', (code) => resolve(code ?? 0));
  });
}
