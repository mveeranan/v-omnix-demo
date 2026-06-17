/** Fields not yet on backend BusinessProfile DTO — persisted in localStorage per tenant. */
export interface BusinessProfileExtension {
  businessSlug: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  isPublished: boolean;
  enableEcommerce: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  customDomain: string;
}

export const BUSINESS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createEmptyBusinessProfileExtension(): BusinessProfileExtension {
  return {
    businessSlug: '',
    tagline: '',
    primaryColor: '#263238',
    secondaryColor: '#ff6f00',
    isPublished: false,
    enableEcommerce: true,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    customDomain: ''
  };
}

export function canPublishProfile(
  businessName: string | undefined,
  ext: BusinessProfileExtension
): boolean {
  return Boolean(businessName?.trim() && ext.businessSlug.trim() && BUSINESS_SLUG_PATTERN.test(ext.businessSlug));
}
