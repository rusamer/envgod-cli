import { Command } from 'commander';
import { apiFetch } from '../lib/api';

interface RequestsOptions {
  org: string;
  status?: 'PENDING' | 'APPROVED' | 'DENIED';
}

type AccessRequest = {
  id: string;
  orgId: string;
  projectId: string;
  envId: string;
  serviceId: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  api_key_prefix?: string;
  createdAt?: string;
};

async function handleRequests(options: RequestsOptions) {
  try {
    const params = new URLSearchParams({ orgId: options.org });
    if (options.status) params.set('status', options.status);
    const data = await apiFetch(`/cp/access-requests?${params.toString()}`) as { items: AccessRequest[] } | AccessRequest[];
    const items = Array.isArray(data) ? data : (data?.items ?? []);

    if (!items.length) {
      console.log('No requests found.');
      return;
    }

    for (const r of items) {
      const prefix = r.api_key_prefix ? `, key: ${r.api_key_prefix}… (delivered once)` : '';
      console.log(`- ${r.id} [${r.status}] org=${r.orgId} project=${r.projectId} env=${r.envId} service=${r.serviceId}${prefix}`);
    }
  } catch (error) {
    console.error('Failed to list requests.');
  }
}

export const requestsCommand = new Command('requests')
  .description("List my access requests (no api_key values shown)")
  .requiredOption('--org <orgId>', 'Organization ID')
  .option('--status <STATUS>', 'PENDING|APPROVED|DENIED')
  .action(handleRequests);
