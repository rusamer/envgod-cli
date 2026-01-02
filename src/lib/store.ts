import keytar from 'keytar';

const SERVICE = 'envgod-cli';
const ACCOUNT = 'default';

type Persisted = {
  refreshToken?: string;
  accessToken?: string;
  runtimeKeys?: Record<string, string>; // scopeKey -> runtimeKey
};

function scopeKey(input: { orgId: string; projectId: string; envId: string; serviceId: string }): string {
  const { orgId, projectId, envId, serviceId } = input;
  return `org:${orgId}|project:${projectId}|env:${envId}|service:${serviceId}`;
}

async function load(): Promise<Persisted> {
  const data = await keytar.getPassword(SERVICE, ACCOUNT);
  if (!data) return {};
  try { return JSON.parse(data) as Persisted; } catch { return {}; }
}

async function save(obj: Persisted): Promise<void> {
  await keytar.setPassword(SERVICE, ACCOUNT, JSON.stringify(obj));
}

export async function setTokens(refreshToken: string, accessToken: string) {
  const obj = await load();
  obj.refreshToken = refreshToken;
  obj.accessToken = accessToken;
  await save(obj);
}

export async function getTokens(): Promise<{ refreshToken: string; accessToken: string } | null> {
  const obj = await load();
  if (!obj.accessToken && !obj.refreshToken) return null;
  return { refreshToken: obj.refreshToken ?? '', accessToken: obj.accessToken ?? '' };
}

export async function getAccessToken(): Promise<string | null> {
  const obj = await load();
  // TODO: check for expiry and refresh if needed
  return obj.accessToken ?? null;
}

export async function clearTokens() {
  await keytar.deletePassword(SERVICE, ACCOUNT);
}

export async function getRuntimeKey(scope: { orgId: string; projectId: string; envId: string; serviceId: string }): Promise<string | null> {
  const obj = await load();
  const key = obj.runtimeKeys?.[scopeKey(scope)];
  return key ?? null;
}

export async function setRuntimeKey(scope: { orgId: string; projectId: string; envId: string; serviceId: string }, apiKey: string): Promise<void> {
  const obj = await load();
  if (!obj.runtimeKeys) obj.runtimeKeys = {};
  obj.runtimeKeys[scopeKey(scope)] = apiKey;
  await save(obj);
}
