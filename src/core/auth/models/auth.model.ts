import { SubscriptionStatus, parseSubscriptionStatus } from '@shared/models/enums/subscription-status.enum';

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
  lastPlanId?: string | null;
  subscriptionStatus?: SubscriptionStatus | null;
}

/** Workspace fields persisted in localStorage (excluding access token). */
export interface ActiveWorkspace {
  tenantId: string;
  tenantName: string;
  businessLogoUrl: string | null;
  roleName: string;
  planName: string;
  multiBranch: boolean;
  lastPlanId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
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
  tenantId?: string;
  tenantName?: string;
  businessLogoUrl?: string | null;
  roleName?: string;
  planName?: string;
  multiBranch?: boolean;
  lastPlanId?: string | null;
  subscriptionStatus?: SubscriptionStatus | null;
}

export interface RefreshTokenResponseData {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
}

export function extractLoginContexts(data: LoginData): AuthContext[] {
  const fromArray = (data.contexts ?? []).map((item) =>
    normalizeAuthContext(withParentAuthFields(item, data))
  );
  if (fromArray.length > 0) {
    return fromArray;
  }
  if (data.tenantId?.trim()) {
    return [normalizeAuthContext(data)];
  }
  return [];
}

function withParentAuthFields(item: unknown, parent: LoginData): unknown {
  const record = { ...((item ?? {}) as Record<string, unknown>) };
  const parentRaw = parent as LoginData & Record<string, unknown>;

  if (!pickOptionalString(record['lastPlanId'], record['LastPlanId'])) {
    const parentLastPlanId = pickOptionalString(
      parent.lastPlanId,
      parentRaw['LastPlanId'],
      parentRaw['lastPlanId']
    );
    if (parentLastPlanId) {
      record['lastPlanId'] = parentLastPlanId;
    }
  }

  const hasStatus =
    parseSubscriptionStatus(record['subscriptionStatus']) ??
    parseSubscriptionStatus(record['SubscriptionStatus']) ??
    parseSubscriptionStatus(record['susu']) ??
    parseSubscriptionStatus(record['Susu']);

  if (!hasStatus) {
    const parentStatus =
      parseSubscriptionStatus(parent.subscriptionStatus) ??
      parseSubscriptionStatus(parentRaw['SubscriptionStatus']) ??
      parseSubscriptionStatus(parentRaw['subscriptionStatus']) ??
      parseSubscriptionStatus(parentRaw['susu']) ??
      parseSubscriptionStatus(parentRaw['Susu']);
    if (parentStatus) {
      record['subscriptionStatus'] = parentStatus;
    }
  }

  return record;
}

export function normalizeAuthContext(raw: unknown): AuthContext {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    tenantId: pickString(item['tenantId'], item['TenantId']),
    tenantName: pickString(item['tenantName'], item['TenantName']),
    businessLogoUrl: pickOptionalString(item['businessLogoUrl'], item['BusinessLogoUrl']) ?? null,
    roleName: pickString(item['roleName'], item['RoleName']),
    planName: pickString(item['planName'], item['PlanName']),
    multiBranch: pickBoolean(item['multiBranch'], item['MultiBranch']) ?? false,
    lastPlanId: pickOptionalString(item['lastPlanId'], item['LastPlanId']) ?? null,
    subscriptionStatus:
      parseSubscriptionStatus(item['subscriptionStatus']) ??
      parseSubscriptionStatus(item['SubscriptionStatus']) ??
      parseSubscriptionStatus(item['susu']) ??
      parseSubscriptionStatus(item['Susu']) ??
      null
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
