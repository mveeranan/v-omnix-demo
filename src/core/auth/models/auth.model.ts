export interface LoginRequest {
  email: string;
  password: string;
}

/** @deprecated Used only by legacy auth-token mapper; refresh flow updates access token directly. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContext {
  tenantId: string;
  tenantName: string;
  businessLogoUrl?: string | null;
  roleName: string;
  planName: string;
  multiBranch: boolean;
}

/** Workspace fields persisted in localStorage (excluding access token). */
export interface ActiveWorkspace {
  tenantId: string;
  tenantName: string;
  businessLogoUrl: string | null;
  roleName: string;
  planName: string;
  multiBranch: boolean;
}

export interface LoginData {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  profileImageDocumentId?: string | null;
  profileImageUrl?: string | null;
  contexts?: AuthContext[];
  /** Optional flat tenant fields when API returns a single account without contexts[]. */
  tenantId?: string;
  tenantName?: string;
  businessLogoUrl?: string | null;
  roleName?: string;
  planName?: string;
  multiBranch?: boolean;
}

export interface RefreshTokenResponseData {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
}

export function extractLoginContexts(data: LoginData): AuthContext[] {
  const fromArray = (data.contexts ?? []).map((item) => normalizeAuthContext(item));
  if (fromArray.length > 0) {
    return fromArray;
  }
  if (data.tenantId?.trim()) {
    return [normalizeAuthContext(data)];
  }
  return [];
}

export function normalizeAuthContext(raw: unknown): AuthContext {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    tenantId: pickString(item['tenantId'], item['TenantId']),
    tenantName: pickString(item['tenantName'], item['TenantName']),
    businessLogoUrl: pickOptionalString(item['businessLogoUrl'], item['BusinessLogoUrl']) ?? null,
    roleName: pickString(item['roleName'], item['RoleName']),
    planName: pickString(item['planName'], item['PlanName']),
    multiBranch: pickBoolean(item['multiBranch'], item['MultiBranch']) ?? false
  };
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function pickOptionalString(...values: unknown[]): string | undefined {
  const picked = pickString(...values);
  return picked || undefined;
}

function pickBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true' || value === '1') {
      return true;
    }
    if (value === 'false' || value === '0') {
      return false;
    }
  }
  return undefined;
}
