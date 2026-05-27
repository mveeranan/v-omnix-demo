import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LoggerService } from '../logging/logger.service';
import {
  ActiveWorkspace,
  AuthContext,
  LoginData,
  LoginRequest,
  RefreshTokenResponseData,
  extractLoginContexts,
  normalizeAuthContext
} from './models/auth.model';
import { API_ENDPOINTS } from '../../../environments/api.constants';
import { ApiResponse } from '../../shared/models/api-response.model';

const STORAGE_KEYS = {
  accessToken: 'access_token',
  tenantId: 'tenant_id',
  tenantName: 'tenant_name',
  businessLogoUrl: 'business_logo_url',
  roleName: 'role_name',
  planName: 'plan_name',
  multiBranch: 'multi_branch'
} as const;

const LEGACY_STORAGE_KEYS = [
  'refresh_token',
  'expires_at',
  'user_id',
  'user_email',
  'profile_image_document_id',
  'profile_image_url',
  'role_id',
  'business_logo_document_id',
  'tenantId',
  'TenantId'
] as const;

const SESSION_PLAN_KEYS = ['work-orbit.tenant.planName', 'work-orbit.tenant.planId'] as const;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  login(payload: LoginRequest): Observable<LoginData> {
    return this.http
      // No withCredentials on login: works with AllowAnyOrigin CORS. Refresh uses credentials + updated API CORS.
      .post<ApiResponse<LoginData>>(API_ENDPOINTS.auth.login, payload)
      .pipe(
        map((response) => {
          if (!response.success || !response.data?.token) {
            throw new Error(response.message || 'Login failed');
          }
          return response.data;
        }),
        tap((data) => this.persistLogin(data))
      );
  }

  refreshToken(): Observable<string> {
    const currentToken = this.getAccessToken();
    return this.http
      .post<ApiResponse<RefreshTokenResponseData>>(
        API_ENDPOINTS.auth.refresh,
        {},
        {
          withCredentials: true,
          headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : undefined
        }
      )
      .pipe(
        map((response) => {
          if (!response.success || !response.data?.token) {
            throw new Error(response.message || 'Token refresh failed');
          }
          return response.data.token;
        }),
        tap((token) => {
          localStorage.setItem(STORAGE_KEYS.accessToken, token);
        })
      );
  }

  logout(): void {
    this.clearAllStorage();
    this.logger.info('User session has been cleared.');
  }

  isLoggedIn(): boolean {
    return Boolean(this.getAccessToken());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getTenantId(): string | null {
    return this.readTenantIdFromStorage() ?? this.getTenantIdFromToken();
  }

  resolveTenantId(explicit?: string | null): string | null {
    const trimmed = explicit?.trim();
    if (trimmed) {
      return trimmed;
    }
    return this.getTenantId();
  }

  setTenantId(tenantId: string): void {
    this.setOrRemove(STORAGE_KEYS.tenantId, tenantId);
  }

  getTenantName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.tenantName);
  }

  getRoleName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.roleName);
  }

  getBusinessLogoUrl(): string | null {
    return localStorage.getItem(STORAGE_KEYS.businessLogoUrl);
  }

  getPlanName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.planName);
  }

  getMultiBranch(): boolean | null {
    const raw = localStorage.getItem(STORAGE_KEYS.multiBranch);
    if (raw === 'true') {
      return true;
    }
    if (raw === 'false') {
      return false;
    }
    return null;
  }

  getActiveWorkspace(): ActiveWorkspace | null {
    const tenantId = this.getTenantId();
    if (!tenantId || !this.getAccessToken()) {
      return null;
    }
    const multiBranch = this.getMultiBranch();
    return {
      tenantId,
      tenantName: this.getTenantName() ?? '',
      businessLogoUrl: this.getBusinessLogoUrl(),
      roleName: this.getRoleName() ?? '',
      planName: this.getPlanName() ?? '',
      multiBranch: multiBranch ?? false
    };
  }

  persistLogin(data: LoginData): void {
    this.clearLegacyStorage();
    localStorage.setItem(STORAGE_KEYS.accessToken, data.token);

    const contexts = extractLoginContexts(data);
    if (contexts.length === 1 && contexts[0].tenantId) {
      this.persistActiveContext(contexts[0]);
    }
  }

  normalizeAuthContext(context: unknown): AuthContext {
    return normalizeAuthContext(context);
  }

  persistActiveContext(context: AuthContext): void {
    const normalized = normalizeAuthContext(context);
    this.clearLegacyStorage();
    this.setOrRemove(STORAGE_KEYS.tenantId, normalized.tenantId);
    this.setOrRemove(STORAGE_KEYS.tenantName, normalized.tenantName);
    this.setOrRemove(STORAGE_KEYS.businessLogoUrl, normalized.businessLogoUrl ?? null);
    this.setOrRemove(STORAGE_KEYS.roleName, normalized.roleName);
    this.setOrRemove(STORAGE_KEYS.planName, normalized.planName);
    localStorage.setItem(STORAGE_KEYS.multiBranch, normalized.multiBranch ? 'true' : 'false');
  }

  clearActiveContext(): void {
    [
      STORAGE_KEYS.tenantId,
      STORAGE_KEYS.tenantName,
      STORAGE_KEYS.businessLogoUrl,
      STORAGE_KEYS.roleName,
      STORAGE_KEYS.planName,
      STORAGE_KEYS.multiBranch
    ].forEach((key) => localStorage.removeItem(key));
  }

  private clearAllStorage(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    this.clearLegacyStorage();
    SESSION_PLAN_KEYS.forEach((key) => sessionStorage.removeItem(key));
  }

  private clearLegacyStorage(): void {
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  private readTenantIdFromStorage(): string | null {
    const keys = [STORAGE_KEYS.tenantId, 'tenantId', 'TenantId'];
    for (const key of keys) {
      const value = localStorage.getItem(key)?.trim();
      if (value) {
        return value;
      }
    }
    return null;
  }

  private getTenantIdFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return null;
      }
      const payload = JSON.parse(atob(payloadPart)) as Record<string, unknown>;
      const candidate = pickString(
        payload['tenant_id'],
        payload['tenantId'],
        payload['TenantId'],
        payload['tid']
      );
      return candidate || null;
    } catch {
      return null;
    }
  }

  private setOrRemove(key: string, value: string | null | undefined): void {
    if (value === null || value === undefined || value === '') {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, value);
  }
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}
