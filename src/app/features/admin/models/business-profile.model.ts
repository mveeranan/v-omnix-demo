import { UploadDocumentRequest } from '../../../shared/files/upload-document.model';

export interface BusinessProfileDto {
  id?: string;
  tenantId?: string;
  businessName: string;
  email?: string | null;
  phone?: string | null;
  businessTypeId: string;
  description?: string | null;
  logoDocumentId?: string | null;
  coverImageDocumentId?: string | null;
  logoDocumentUrl?: string | null;
  coverImageDocumentUrl?: string | null;
  /** @deprecated Prefer logoDocumentUrl from API */
  logoUrl?: string | null;
  /** @deprecated Prefer coverImageDocumentUrl from API */
  coverImageUrl?: string | null;
  websiteUrl?: string | null;
  timeZone?: string | null;
  currency?: string | null;
}

export interface BusinessProfileUpsertRequest {
  tenantId: string;
  businessName: string;
  email?: string | null;
  phone?: string | null;
  businessTypeId: string;
  description?: string | null;
  logoDocumentId?: string | null;
  coverImageDocumentId?: string | null;
  websiteUrl?: string | null;
  timeZone?: string | null;
  currency?: string | null;
  isActive?: boolean;
  attachments?: UploadDocumentRequest[];
}

/** Payload from the profile form (tenantId added in state service). */
export type BusinessProfileUpdateRequest = Omit<BusinessProfileUpsertRequest, 'tenantId'>;

export function createEmptyBusinessProfile(tenantId?: string): BusinessProfileDto {
  return {
    tenantId: tenantId ?? '',
    businessName: '',
    businessTypeId: '',
    email: null,
    phone: null,
    description: null,
    logoDocumentId: null,
    coverImageDocumentId: null,
    websiteUrl: null,
    timeZone: null,
    currency: null
  };
}

function pickUrl(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '';
}

export function getLogoPreviewUrl(profile: BusinessProfileDto | null | undefined): string {
  if (!profile) return '';
  const raw = profile as BusinessProfileDto & Record<string, unknown>;
  return pickUrl(
    profile.logoDocumentUrl,
    raw['LogoDocumentUrl'] as string | undefined,
    profile.logoUrl,
    raw['LogoUrl'] as string | undefined
  );
}

export function getCoverPreviewUrl(profile: BusinessProfileDto | null | undefined): string {
  if (!profile) return '';
  const raw = profile as BusinessProfileDto & Record<string, unknown>;
  return pickUrl(
    profile.coverImageDocumentUrl,
    raw['CoverImageDocumentUrl'] as string | undefined,
    raw['storyDocumentUrl'] as string | undefined,
    raw['StoryDocumentUrl'] as string | undefined,
    profile.coverImageUrl,
    raw['CoverImageUrl'] as string | undefined
  );
}

export function hasBusinessProfileData(profile: BusinessProfileDto | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.businessName?.trim() ||
      profile.businessTypeId?.trim() ||
      profile.email?.trim() ||
      profile.phone?.trim()
  );
}
