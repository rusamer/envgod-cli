// Default base URL if nothing else is configured
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

// Backwards-compatible export used by older helpers. Prefer resolveApiBaseUrl() where possible.
export const API_BASE_URL = process.env.ENVGUARDS_API_URL || DEFAULT_API_BASE_URL;

export async function resolveApiBaseUrl(): Promise<string> {
  // Future: read from CLI config file. For now, prefer ENV var, then fallback.
  return process.env.ENVGUARDS_API_URL || API_BASE_URL || DEFAULT_API_BASE_URL;
}
