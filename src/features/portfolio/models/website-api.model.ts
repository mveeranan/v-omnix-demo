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
  /** Chosen layout style id, e.g. "circular-cards". Stored on WebsiteSection.LayoutStyle. */
  layoutStyle?: string | null;
  /** How many configured items to display on the live site. Stored on WebsiteSection.ItemLimit. */
  itemLimit?: number | null;
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

/** Mirrors the backend's WebsiteSectionDto — one saved home-page section row. */
export interface WebsiteSectionListItem {
  id: string;
  sectionType: string;
  enabled: boolean;
  title: string | null;
  displayOrder: number;
  contentJson: string;
}

/** Payload for PUT /website/theme — preset choice plus optional per-tenant token overrides. */
export interface WebsiteThemeSaveRequest {
  tenantId: string;
  presetId?: string | null;
  overrides?: Record<string, unknown> | null;
}

// Maps each editor section ID to the backend WebsiteSectionType enum name.
// Sections handled by dedicated services (brand→BusinessProfile, hero→HeroSlide,
// social→SocialMedia, theme→BusinessProfile, publish→PublishWebsite) are excluded.
const SECTION_API_TYPE: Partial<Record<WebsiteSectionId, string>> = {
  categoryShowcase: 'FeaturedCategories',
  whyChooseUs:      'WhyChooseUs',
  stats:            'RichText',
  contactSupport:   'ContactSupport',
  announcementBar:  'AnnouncementBar',
  faq:              'FAQ',
  newArrivals:      'NewArrivals',
  brandStrip:       'BrandStrip',
  trustBadges:      'TrustBadges',
  dealOfWeek:       'DealOfWeek',
  featuredProducts: 'FeaturedProducts',
  reviewsSection:   'Testimonials',
  gallerySection:   'ImageGallery',
  newsletter:       'NewsletterSignup'
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

/**
 * Pulls the top-level presentation fields (display name, layout style, item
 * limit) out of a section slice so they can be sent as first-class request
 * fields — the backend stores them on dedicated WebsiteSection columns, not
 * inside ContentJson.
 */
function readSectionMeta(partial: Partial<Portfolio>): {
  title?: string | null;
  layoutStyle?: string | null;
  itemLimit?: number | null;
} {
  const keys = Object.keys(partial) as (keyof Portfolio)[];
  for (const key of keys) {
    const slice = partial[key];
    if (slice && typeof slice === 'object') {
      const s = slice as { displayName?: string; layoutStyle?: string; itemLimit?: number };
      if ('displayName' in s || 'layoutStyle' in s || 'itemLimit' in s) {
        return {
          title: s.displayName?.trim() || null,
          layoutStyle: s.layoutStyle || null,
          itemLimit: typeof s.itemLimit === 'number' ? s.itemLimit : null
        };
      }
    }
  }
  return {};
}

export function buildWebsiteSectionSaveRequest(
  tenantId: string,
  sectionId: WebsiteSectionId,
  partial: Partial<Portfolio>
): WebsiteSectionSaveRequest {
  const meta = readSectionMeta(partial);
  return {
    tenantId,
    sectionType: websiteSectionApiType(sectionId),
    enabled: readEnabled(partial),
    title: meta.title,
    layoutStyle: meta.layoutStyle,
    itemLimit: meta.itemLimit,
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
