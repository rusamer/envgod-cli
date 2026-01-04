import keytar from 'keytar';
import { API_BASE_URL } from './config';

const SERVICE = 'envguards'; // Simplified service name

// --- Account Key Generation ---

function getCpAccountKey(): string {
  return `cp:${API_BASE_URL}`;
}

function getRuntimeAccountKey(scope: { orgId: string; projectId: string; envId: string; serviceId: string }): string {
  const { orgId, projectId, envId, serviceId } = scope;
  return `runtime:${API_BASE_URL}:${orgId}:${projectId}:${envId}:${serviceId}`;
}

// --- Control Plane Token Management ---

type CpTokens = {
  refreshToken: string;
  accessToken: string;
};

export async function setTokens(refreshToken: string, accessToken: string): Promise<void> {
  const account = getCpAccountKey();
  const value = JSON.stringify({ refreshToken, accessToken });
  await keytar.setPassword(SERVICE, account, value);
}

export async function getTokens(): Promise<CpTokens | null> {
  const account = getCpAccountKey();
  const data = await keytar.getPassword(SERVICE, account);
  if (!data) return null;
  try {
    return JSON.parse(data) as CpTokens;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = await getTokens();
  // TODO: Implement refresh logic if accessToken is expired
  return tokens?.accessToken ?? null;
}

export async function clearTokens(): Promise<void> {
  const account = getCpAccountKey();
  await keytar.deletePassword(SERVICE, account);
}

// --- Data Plane (Runtime Key) Management ---

export async function getRuntimeKey(scope: { orgId: string; projectId: string; envId: string; serviceId: string }): Promise<string | null> {
  const account = getRuntimeAccountKey(scope);
  return keytar.getPassword(SERVICE, account);
}

export async function setRuntimeKey(scope: { orgId: string; projectId: string; envId: string; serviceId: string }, apiKey: string): Promise<void> {
  const account = getRuntimeAccountKey(scope);
  await keytar.setPassword(SERVICE, account, apiKey);
}
