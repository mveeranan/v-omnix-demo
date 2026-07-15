import { UploadDocumentRequest } from '@shared/files/upload-document.model';

export interface BusinessProfileDto {
  id?: string;
  tenantId?: string;

  // Core Business Identity
  businessName: string;
  businessTypeId: string;

  // Contact Information
  email?: string | null;
  phone?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;

  // Brand & Storefront
  tagline?: string | null;
  description?: string | null;

  // Legal & Registration
  registrationNumber?: string | null;
  taxId?: string | null;

  // Physical Address
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;

  // Media
  logoDocumentId?: string | null;
  coverImageDocumentId?: string | null;
  logoDocumentUrl?: string | null;
  coverImageDocumentUrl?: string | null;
  /** @deprecated Prefer logoDocumentUrl from API */
  logoUrl?: string | null;
  /** @deprecated Prefer coverImageDocumentUrl from API */
  coverImageUrl?: string | null;

  // Store Configuration
  websiteUrl?: string | null;
  timeZone?: string | null;
  currency?: string | null;
  presetId?: string | null;
}

export interface BusinessProfileUpsertRequest {
  tenantId: string;

  // Core Business Identity
  businessName: string;
  businessTypeId: string;

  // Contact Information
  email?: string | null;
  phone?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;

  // Brand & Storefront
  tagline?: string | null;
  description?: string | null;

  // Legal & Registration
  registrationNumber?: string | null;
  taxId?: string | null;

  // Physical Address
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;

  // Media
  logoDocumentId?: string | null;
  coverImageDocumentId?: string | null;

  // Store Configuration
  websiteUrl?: string | null;
  timeZone?: string | null;
  currency?: string | null;
  presetId?: string | null;
  isActive?: boolean;
  attachments?: UploadDocumentRequest[];
}

/** Payload from the profile form (tenantId added in state service). */
export type BusinessProfileUpdateRequest = Omit<BusinessProfileUpsertRequest, 'tenantId'>;

export function createEmptyBusinessProfile(tenantId?: string): BusinessProfileDto {
  return {
    tenantId: tenantId ?? '',
    // Core Business Identity
    businessName: '',
    businessTypeId: '',
    // Contact Information
    email: null,
    phone: null,
    supportEmail: null,
    supportPhone: null,
    // Brand & Storefront
    tagline: null,
    description: null,
    // Legal & Registration
    registrationNumber: null,
    taxId: null,
    // Physical Address
    street: null,
    city: null,
    state: null,
    zipCode: null,
    country: null,
    // Media
    logoDocumentId: null,
    coverImageDocumentId: null,
    // Store Configuration
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
      profile.phone?.trim() ||
      profile.supportEmail?.trim() ||
      profile.supportPhone?.trim() ||
      profile.tagline?.trim() ||
      profile.description?.trim() ||
      profile.street?.trim() ||
      profile.city?.trim()
  );
}
