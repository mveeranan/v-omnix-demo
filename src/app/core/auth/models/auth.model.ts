export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContext {
  tenantId: string;
  tenantName: string;
  businessLogoDocumentId?: string | null;
  businessLogoUrl?: string | null;
  roleId: string;
  roleName: string;
}

export interface LoginData {
  token: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  profileImageDocumentId?: string | null;
  profileImageUrl?: string | null;
  contexts: AuthContext[];
}

export interface SelectContextData {
  userId: string;
  email: string;
  tenantId: string;
  tenantName: string;
  roleId: string;
  roleName: string;
  businessLogoDocumentId?: string | null;
  businessLogoUrl?: string | null;
}

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  profileImageDocumentId: string | null;
  profileImageUrl: string | null;
  tenantId: string | null;
  tenantName: string | null;
  roleId: string | null;
  roleName: string | null;
  businessLogoDocumentId: string | null;
  businessLogoUrl: string | null;
}
