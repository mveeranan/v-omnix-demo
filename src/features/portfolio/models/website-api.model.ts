import { WebsiteSectionType } from '@shared/models/backend-enums';
import { WebsiteSectionId } from './website-section.ids';
import { Portfolio } from './portfolio.model';
import { PortfolioCta } from './portfolio.model';

export interface WebsiteSectionSaveRequest {
  tenantId: string;
  sectionType: WebsiteSectionType | string;
  enabled?: boolean;
  title?: string | null;
  subtitle?: string | null;
  // Sent as a plain object; the backend DTO accepts JsonElement
  contentJson: Record<string, unknown>;
}

export interface WebsitePublishRequest {
  tenantId: string;
  slug: string;
  published: boolean;
  ctaLabel?: string | null;
  ctaType?: string | null;
  ctaTarget?: string | null;
}

export interface PublishSectionPayload {
  slug: string;
  cta: PortfolioCta;
  published: boolean;
}

// Maps each editor section ID to the backend WebsiteSectionType enum name.
// Sections handled by dedicated services (brand→BusinessProfile, hero→HeroSlide,
// social→SocialMedia, theme→BusinessProfile, publish→PublishWebsite) are excluded.
const SECTION_API_TYPE: Partial<Record<WebsiteSectionId, string>> = {
  categoryShowcase: 'FeaturedCategories',
  featuredProducts: 'FeaturedProducts',
  offerBanner:      'PromoBanner',
  saleCollection:   'ProductGrid',
  reviews:          'Testimonials',
  whyChooseUs:      'WhyChooseUs',
  stats:            'RichText',
  newsletter:       'NewsletterSignup',
  contactSupport:   'ContactSupport'
};

export function websiteSectionApiType(sectionId: WebsiteSectionId): string {
  return SECTION_API_TYPE[sectionId] ?? 'RichText';
}

function readEnabled(partial: Partial<Portfolio>): boolean | undefined {
  const keys = Object.keys(partial) as (keyof Portfolio)[];
  for (const key of keys) {
    const slice = partial[key];
    if (slice && typeof slice === 'object' && 'enabled' in slice) {
      return Boolean((slice as { enabled?: boolean }).enabled);
    }
  }
  return undefined;
}

export function buildWebsiteSectionSaveRequest(
  tenantId: string,
  sectionId: WebsiteSectionId,
  partial: Partial<Portfolio>
): WebsiteSectionSaveRequest {
  return {
    tenantId,
    sectionType: websiteSectionApiType(sectionId),
    enabled: readEnabled(partial),
    contentJson: partial as Record<string, unknown>
  };
}

export function buildWebsitePublishRequest(
  tenantId: string,
  payload: PublishSectionPayload
): WebsitePublishRequest {
  return {
    tenantId,
    slug: payload.slug.trim(),
    published: payload.published,
    ctaLabel: payload.cta.label?.trim() || null,
    ctaType: payload.cta.type || null,
    ctaTarget: payload.cta.target?.trim() || null
  };
}
