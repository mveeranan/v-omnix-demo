import { AuthService } from '@core/auth/auth.service';
import { ApiResponse, getFirstApiError } from '@shared/models/api-response.model';

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    const detail = getFirstApiError(response.errors);
    throw new Error(detail || response.message || 'Request failed');
  }
  return response.data;
}

export function requireTenantId(auth: AuthService): string {
  const tenantId = auth.resolveTenantId();
  if (!tenantId) {
    throw new Error('No tenant selected. Please log in again.');
  }
  return tenantId;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
