import { API_BASE_URL, resolveApiBaseUrl } from './config';

export interface Scope {
  orgId: string;
  projectId: string;
  envId: string;
  serviceId: string;
}

export type SecretsBundle = Record<string, string>;

// Fetch secrets bundle from Data Plane. We avoid logging values.
export async function fetchSecretsBundle(runtimeKey: string, scope: Scope): Promise<SecretsBundle> {
  const base = await resolveApiBaseUrl();
  const url = new URL('/v1/bundle', base);
  url.searchParams.set('orgId', scope.orgId);
  url.searchParams.set('projectId', scope.projectId);
  url.searchParams.set('envId', scope.envId);
  url.searchParams.set('serviceId', scope.serviceId);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${runtimeKey}`,
    },
  });

  if (!res.ok) {
    const message = `Failed to fetch secrets (HTTP ${res.status})`;
    throw new Error(message);
  }

  const data = (await res.json()) as SecretsBundle;
  // Ensure all values are strings
  const out: SecretsBundle = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string') out[k] = v; else out[k] = String(v);
  }
  return out;
}
