import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LoggerService } from '../logging/logger.service';
import {
  AuthContext,
  AuthTokens,
  LoginData,
  LoginRequest,
  SelectContextData,
  UserSession
} from './models/auth.model';
import { AuthTokenDto, AuthTokenMapper } from './mappers/auth-token.mapper';
import { API_ENDPOINTS } from '../../../environments/api.constants';
import { ApiResponse } from '../../shared/models/api-response.model';

const STORAGE_KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  expiresAt: 'expires_at',
  userId: 'user_id',
  userEmail: 'user_email',
  profileImageDocumentId: 'profile_image_document_id',
  profileImageUrl: 'profile_image_url',
  tenantId: 'tenant_id',
  tenantName: 'tenant_name',
  roleId: 'role_id',
  roleName: 'role_name',
  businessLogoDocumentId: 'business_logo_document_id',
  businessLogoUrl: 'business_logo_url'
} as const;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly authTokenMapper = inject(AuthTokenMapper);

  login(payload: LoginRequest): Observable<LoginData> {
    return this.http.post<ApiResponse<LoginData>>(API_ENDPOINTS.auth.login, payload).pipe(
      map((response) => {
        if (!response.success || !response.data?.token) {
          throw new Error(response.message || 'Login failed');
        }
        return response.data;
      }),
      tap((data) => this.persistLogin(data))
    );
  }

  selectContext(userId: string, tenantId: string): Observable<SelectContextData> {
    return this.http
      .post<ApiResponse<SelectContextData>>(API_ENDPOINTS.auth.selectContext, { userId, tenantId })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Context selection failed');
          }
          return response.data;
        }),
        tap((data) => this.persistContextSelection(data))
      );
  }

  refreshToken(): Observable<AuthTokens> {
    return this.http
      .post<AuthTokenDto>(API_ENDPOINTS.auth.refresh, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(map((dto) => this.authTokenMapper.map(dto)))
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  logout(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    this.logger.info('User session has been cleared.');
  }

  isLoggedIn(): boolean {
    return Boolean(this.getAccessToken());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  getTenantId(): string | null {
    return this.readTenantIdFromStorage() ?? this.getTenantIdFromToken();
  }

  /** Prefer explicit value, then localStorage, then JWT claim. */
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

  getRoleId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.roleId);
  }

  getUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.userId);
  }

  getUserEmail(): string | null {
    return localStorage.getItem(STORAGE_KEYS.userEmail);
  }

  getSession(): UserSession | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return null;
    }
    return {
      accessToken,
      refreshToken: this.getRefreshToken() ?? '',
      expiresAt: localStorage.getItem(STORAGE_KEYS.expiresAt) ?? '',
      userId: localStorage.getItem(STORAGE_KEYS.userId) ?? '',
      email: localStorage.getItem(STORAGE_KEYS.userEmail) ?? '',
      profileImageDocumentId: localStorage.getItem(STORAGE_KEYS.profileImageDocumentId),
      profileImageUrl: localStorage.getItem(STORAGE_KEYS.profileImageUrl),
      tenantId: localStorage.getItem(STORAGE_KEYS.tenantId),
      tenantName: localStorage.getItem(STORAGE_KEYS.tenantName),
      roleId: localStorage.getItem(STORAGE_KEYS.roleId),
      roleName: localStorage.getItem(STORAGE_KEYS.roleName),
      businessLogoDocumentId: localStorage.getItem(STORAGE_KEYS.businessLogoDocumentId),
      businessLogoUrl: localStorage.getItem(STORAGE_KEYS.businessLogoUrl)
    };
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  }

  persistLogin(data: LoginData): void {
    this.setTokens({
      accessToken: data.token,
      refreshToken: data.refreshToken ?? ''
    });
    this.setOrRemove(STORAGE_KEYS.expiresAt, data.expiresAt);
    this.setOrRemove(STORAGE_KEYS.userId, data.userId);
    this.setOrRemove(STORAGE_KEYS.userEmail, data.email);
    this.setOrRemove(STORAGE_KEYS.profileImageDocumentId, data.profileImageDocumentId ?? null);
    this.setOrRemove(STORAGE_KEYS.profileImageUrl, data.profileImageUrl ?? null);

    const contexts = (data.contexts ?? []).map((c) => this.normalizeContext(c));
    if (contexts.length === 1 && contexts[0].tenantId) {
      this.persistActiveContext(contexts[0]);
    }
  }

  normalizeAuthContext(context: AuthContext | SelectContextData): AuthContext {
    return this.normalizeContext(context);
  }

  persistActiveContext(context: AuthContext): void {
    const normalized = this.normalizeContext(context);
    this.setOrRemove(STORAGE_KEYS.tenantId, normalized.tenantId);
    this.setOrRemove(STORAGE_KEYS.tenantName, normalized.tenantName);
    this.setOrRemove(STORAGE_KEYS.roleId, normalized.roleId);
    this.setOrRemove(STORAGE_KEYS.roleName, normalized.roleName);
    this.setOrRemove(
      STORAGE_KEYS.businessLogoDocumentId,
      normalized.businessLogoDocumentId ?? null
    );
    this.setOrRemove(STORAGE_KEYS.businessLogoUrl, normalized.businessLogoUrl ?? null);
  }

  persistContextSelection(data: SelectContextData): void {
    this.setOrRemove(STORAGE_KEYS.userId, data.userId);
    this.setOrRemove(STORAGE_KEYS.userEmail, data.email);
    this.persistActiveContext(this.normalizeContext(data));
  }

  clearActiveContext(): void {
    [
      STORAGE_KEYS.tenantId,
      STORAGE_KEYS.tenantName,
      STORAGE_KEYS.roleId,
      STORAGE_KEYS.roleName,
      STORAGE_KEYS.businessLogoDocumentId,
      STORAGE_KEYS.businessLogoUrl
    ].forEach((key) => localStorage.removeItem(key));
  }

  private normalizeContext(context: AuthContext | SelectContextData): AuthContext {
    const raw = context as AuthContext & Record<string, unknown>;
    return {
      tenantId: this.pickString(raw.tenantId, raw['TenantId']),
      tenantName: this.pickString(raw.tenantName, raw['TenantName']),
      roleId: this.pickString(raw.roleId, raw['RoleId']),
      roleName: this.pickString(raw.roleName, raw['RoleName']),
      businessLogoDocumentId:
        this.pickOptionalString(raw.businessLogoDocumentId, raw['BusinessLogoDocumentId']) ?? null,
      businessLogoUrl: this.pickOptionalString(raw.businessLogoUrl, raw['BusinessLogoUrl']) ?? null
    };
  }

  private pickString(...values: unknown[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }

  private pickOptionalString(...values: unknown[]): string | undefined {
    const picked = this.pickString(...values);
    return picked || undefined;
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
      const candidate = this.pickString(
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
