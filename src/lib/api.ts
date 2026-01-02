import { API_BASE_URL } from './config';
import { getAccessToken } from './store';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorBody.message || 'An unknown error occurred');
  }

  return response.json();
}
