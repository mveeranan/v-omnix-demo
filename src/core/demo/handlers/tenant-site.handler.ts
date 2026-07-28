import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { BUSINESS_PROFILE_COLLECTION, collectionForTenant, DEFAULT_DEMO_TENANT_ID, DemoRequestContext, fail, ok } from '../generic-crud';
import { DemoUserRecord, findUserByTenant } from './auth.handler';
import { registerDemoDocument, resolveDocumentUrl } from './documents.handler';
import heroSlidesSeed from '@mock-data/hero-slides.json';

const FILE_CATEGORY_BUSINESS_LOGO = 2;
const FILE_CATEGORY_BANNER_IMAGE = 9;

/**
 * The real API's `GET /portfolio/:tenantIdOrSlug` is a single "give me everything about this
 * tenant" bootstrap call — it's what the admin Profile page, Personal Info section, and the
 * public storefront (by slug) all actually read from, NOT the individual `/business-profiles`
 * or `/User` GET endpoints (those only exist for writes/other flows). Returning `data: null`
 * unconditionally here (the old stub) meant the Profile page always showed "Could not load
 * business profile" / "Could not load user details" for every tenant, and the storefront always
 * showed "Store not found" since a null `website.published` never satisfies the publish check.
 *
 * This handler persists (tenant-scoped) business profile, hero slides, social media, and the
 * published-website record, and assembles them into the shape `PortfolioApiDto` expects.
 */

interface BusinessProfileRecord {
  id?: string; tenantId?: string; businessName: string; businessTypeId: string;
  email?: string | null; phone?: string | null; tagline?: string | null; description?: string | null;
  registrationNumber?: string | null; taxId?: string | null;
  street?: string | null; city?: string | null; state?: string | null; zipCode?: string | null;
  countryIsoCode?: string | null; countryName?: string | null;
  logoDocumentId?: string | null; logoDocumentUrl?: string | null;
  coverImageDocumentId?: string | null; coverImageDocumentUrl?: string | null;
  websiteUrl?: string | null; presetId?: string | null;
}
interface SocialMediaRecord { tenantId: string; links: Array<{ id: string; type: number; url: string }> }
interface HeroSlideRecord {
  id: string; isDisplaySlideshow: boolean; eyebrow: string; headline: string; subHeadline: string;
  sortOrder: number; slideImageDocumentId: string | null; slideImageDocumentUrl: string | null;
}
interface WebsiteSectionRecord { id: string; sectionType: string; enabled: boolean; title: string | null; displayOrder: number; contentJson: string }
interface WebsiteRecord {
  slug: string; published: boolean; updatedAt: string;
  ctaLabel: string | null; ctaType: string | null; ctaTarget: string | null;
  sections: WebsiteSectionRecord[]; theme: { presetId: string | null; overrides: Record<string, unknown> | null } | null;
}

const BUSINESS_PROFILE_KEY = BUSINESS_PROFILE_COLLECTION;
const HERO_SLIDES_KEY = 'heroSlides';
const SOCIAL_MEDIA_KEY = 'socialMedia';
const WEBSITE_KEY = 'website';
const SLUG_INDEX_KEY = 'slugIndex'; // global (not tenant-scoped) — slugs are unique across tenants
const DEMO_STORE_SLUG = 'demo-store';

/** Rich seed content for the default demo tenant only — every other (real registration) tenant
 * starts with `null`/unpublished, matching the tenantSeed()/seedForTenant() convention used
 * elsewhere for products/categories/etc. */
const DEMO_BUSINESS_PROFILE: BusinessProfileRecord = {
  tenantId: DEFAULT_DEMO_TENANT_ID,
  businessName: 'Demo Store',
  businessTypeId: 'bt-general',
  email: 'hello@demostore.example',
  phone: '+91 90000 00000',
  tagline: 'Everyday essentials, delivered with care',
  description: 'A neighborhood favorite for perfumes, clothing, footwear, electronics, and daily essentials — now online.',
  registrationNumber: null, taxId: null,
  street: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', zipCode: '560001',
  countryIsoCode: 'IN', countryName: 'India',
  logoDocumentId: null, logoDocumentUrl: null, coverImageDocumentId: null, coverImageDocumentUrl: null,
  websiteUrl: null, presetId: null
};

function getBusinessProfile(db: DemoDbService, tenantId: string): BusinessProfileRecord | null {
  const seed = tenantId === DEFAULT_DEMO_TENANT_ID ? DEMO_BUSINESS_PROFILE : null;
  return db.getObject<BusinessProfileRecord | null>(collectionForTenant(BUSINESS_PROFILE_KEY, tenantId), seed);
}
function saveBusinessProfile(db: DemoDbService, tenantId: string, profile: BusinessProfileRecord): void {
  db.saveObject(collectionForTenant(BUSINESS_PROFILE_KEY, tenantId), profile);
}
function getHeroSlides(db: DemoDbService, tenantId: string): HeroSlideRecord[] {
  const seed = tenantId === DEFAULT_DEMO_TENANT_ID ? (heroSlidesSeed as HeroSlideRecord[]) : [];
  return db.getAll<HeroSlideRecord>(collectionForTenant(HERO_SLIDES_KEY, tenantId), seed);
}
function getSocialMedia(db: DemoDbService, tenantId: string): SocialMediaRecord | null {
  return db.getObject<SocialMediaRecord | null>(collectionForTenant(SOCIAL_MEDIA_KEY, tenantId), null);
}
function getWebsite(db: DemoDbService, tenantId: string): WebsiteRecord | null {
  const seed: WebsiteRecord | null = tenantId === DEFAULT_DEMO_TENANT_ID
    ? {
        slug: DEMO_STORE_SLUG, published: true, updatedAt: new Date().toISOString(),
        ctaLabel: 'Shop now', ctaType: 'products', ctaTarget: null, sections: [], theme: null
      }
    : null;
  return db.getObject<WebsiteRecord | null>(collectionForTenant(WEBSITE_KEY, tenantId), seed);
}
function saveWebsite(db: DemoDbService, tenantId: string, site: WebsiteRecord): void {
  db.saveObject(collectionForTenant(WEBSITE_KEY, tenantId), site);
}
function getSlugIndex(db: DemoDbService): Record<string, string> {
  return db.getObject<Record<string, string>>(SLUG_INDEX_KEY, { [DEMO_STORE_SLUG]: DEFAULT_DEMO_TENANT_ID });
}
function saveSlugIndex(db: DemoDbService, index: Record<string, string>): void {
  db.saveObject(SLUG_INDEX_KEY, index);
}

/** A store slug and a tenantId are never the same string shape in real life, but in demo mode
 * both are just strings in the URL — try tenantId first (does a user own this tenant?), then
 * fall back to the slug index. Returns null if neither resolves (genuinely unknown). */
export function resolveTenantIdOrSlug(db: DemoDbService, idOrSlug: string): string | null {
  if (findUserByTenant(db, idOrSlug)) return idOrSlug;
  const index = getSlugIndex(db);
  return index[idOrSlug] ?? null;
}

function toUserApiDto(user: DemoUserRecord) {
  return {
    id: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, mobileNumber: user.mobile,
    profileImageUrl: user.profileImageUrl ?? null
  };
}

function buildPortfolioPayload(db: DemoDbService, tenantId: string) {
  const user = findUserByTenant(db, tenantId);
  const website = getWebsite(db, tenantId);
  return {
    user: user ? toUserApiDto(user) : null,
    businessProfile: getBusinessProfile(db, tenantId),
    heroSlides: getHeroSlides(db, tenantId),
    socialMedia: getSocialMedia(db, tenantId),
    // Minimal PortfolioDto — PortfolioMapper defaults every other field, so this is enough for
    // a genuinely valid, non-throwing `Portfolio` with the right id/slug/published/updatedAt.
    website: website
      ? { id: tenantId, slug: website.slug, published: website.published, updatedAt: website.updatedAt }
      : null
  };
}

export function handleTenantSite(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  // GET /portfolio/:tenantIdOrSlug — the combined bootstrap read (admin Profile/Personal-info
  // pages AND the public storefront-by-slug both call this).
  const portfolioMatch = ctx.path.match(/^\/portfolio\/([^/]+)$/);
  if (portfolioMatch && ctx.method === 'GET') {
    const resolved = resolveTenantIdOrSlug(db, decodeURIComponent(portfolioMatch[1]));
    if (!resolved) return ok(null);
    return ok(buildPortfolioPayload(db, resolved));
  }

  if (ctx.path.startsWith('/business-profiles')) {
    if (ctx.method === 'GET') {
      const rest = ctx.path.slice('/business-profiles'.length).replace(/^\//, '');
      const tenantId = rest ? decodeURIComponent(rest) : ctx.tenantId;
      if (!tenantId) return ok(null);
      return ok(getBusinessProfile(db, tenantId));
    }
    if (ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as Record<string, unknown> & {
        attachments?: Array<{ fileCategory: number; files: Array<{ fileName: string; contentType: string; base64Content: string }> }>;
      };
      const tenantId = String(body['tenantId'] ?? ctx.tenantId ?? '');
      if (!tenantId) return fail('No tenant selected.', 400);
      const existing = getBusinessProfile(db, tenantId);

      // Logo/cover uploads arrive as inline `attachments` on this same request (not a separate
      // `/documents/upload` call) — register each as a document and use its id, taking priority
      // over any documentId already present on the payload (a fresh attachment replaces the old one).
      let logoDocumentId = (body['logoDocumentId'] as string) ?? existing?.logoDocumentId ?? null;
      let coverImageDocumentId = (body['coverImageDocumentId'] as string) ?? existing?.coverImageDocumentId ?? null;
      for (const attachment of body.attachments ?? []) {
        const file = attachment.files?.[0];
        if (!file) continue;
        const doc = registerDemoDocument(db, file, attachment.fileCategory);
        if (attachment.fileCategory === FILE_CATEGORY_BUSINESS_LOGO) logoDocumentId = doc.id;
        else if (attachment.fileCategory === FILE_CATEGORY_BANNER_IMAGE) coverImageDocumentId = doc.id;
      }
      const profile: BusinessProfileRecord = {
        id: existing?.id ?? db.newId(),
        tenantId,
        businessName: String(body['businessName'] ?? existing?.businessName ?? ''),
        businessTypeId: String(body['businessTypeId'] ?? existing?.businessTypeId ?? ''),
        email: (body['email'] as string) ?? null,
        phone: (body['phone'] as string) ?? null,
        tagline: (body['tagline'] as string) ?? null,
        description: (body['description'] as string) ?? null,
        registrationNumber: (body['registrationNumber'] as string) ?? null,
        taxId: (body['taxId'] as string) ?? null,
        street: (body['street'] as string) ?? null,
        city: (body['city'] as string) ?? null,
        state: (body['state'] as string) ?? null,
        zipCode: (body['zipCode'] as string) ?? null,
        countryIsoCode: (body['countryIsoCode'] as string) ?? null,
        countryName: (body['countryName'] as string) ?? null,
        // Uploads land as documents first (via DocumentUploadService), then this PUT arrives with
        // just the documentId — resolve it back to a data: URI so the saved profile actually
        // shows the image, not just an id nothing renders from.
        logoDocumentId,
        logoDocumentUrl: logoDocumentId ? resolveDocumentUrl(db, logoDocumentId) : null,
        coverImageDocumentId,
        coverImageDocumentUrl: coverImageDocumentId ? resolveDocumentUrl(db, coverImageDocumentId) : null,
        websiteUrl: (body['websiteUrl'] as string) ?? null,
        presetId: (body['presetId'] as string) ?? existing?.presetId ?? null
      };
      saveBusinessProfile(db, tenantId, profile);
      return ok(profile, 'Business profile saved');
    }
  }

  if (ctx.path === '/User' && ctx.method === 'PUT') {
    const body = (ctx.body ?? {}) as {
      id?: string; firstName?: string; lastName?: string; email?: string; mobileNumber?: string;
      profileImage?: { fileName: string; contentType: string; base64Content: string } | null;
    };
    const users = db.getAll<DemoUserRecord>('users', []);
    const idx = users.findIndex((u) => u.id === body.id);
    if (idx === -1) return fail('User not found', 404);
    const updated: DemoUserRecord = {
      ...users[idx],
      firstName: body.firstName ?? users[idx].firstName,
      lastName: body.lastName ?? users[idx].lastName,
      email: body.email ?? users[idx].email,
      mobile: body.mobileNumber ?? users[idx].mobile,
      profileImageUrl: body.profileImage
        ? `data:${body.profileImage.contentType};base64,${body.profileImage.base64Content}`
        : users[idx].profileImageUrl
    };
    users[idx] = updated;
    db.saveAll('users', users);
    return ok(toUserApiDto(updated), 'Profile updated');
  }

  if (ctx.path === '/hero-slides' && ctx.method === 'PUT') {
    const body = (ctx.body ?? {}) as {
      tenantId?: string;
      slides?: Array<{
        id?: string; isDisplaySlideshow: boolean; eyebrow: string; headline: string; subHeadline: string;
        sortOrder: number; attachments?: Array<{ files: Array<{ fileName: string; contentType: string; base64Content: string }> }>;
      }>;
    };
    const tenantId = body.tenantId ?? ctx.tenantId;
    if (!tenantId) return fail('No tenant selected.', 400);
    const existing = getHeroSlides(db, tenantId);
    const slides: HeroSlideRecord[] = (body.slides ?? []).map((s) => {
      const file = s.attachments?.[0]?.files?.[0];
      const prior = s.id ? existing.find((e) => e.id === s.id) : undefined;
      return {
        id: s.id ?? db.newId(),
        isDisplaySlideshow: s.isDisplaySlideshow,
        eyebrow: s.eyebrow, headline: s.headline, subHeadline: s.subHeadline, sortOrder: s.sortOrder,
        slideImageDocumentId: prior?.slideImageDocumentId ?? null,
        slideImageDocumentUrl: file
          ? `data:${file.contentType};base64,${file.base64Content}`
          : prior?.slideImageDocumentUrl ?? null
      };
    });
    db.saveAll(collectionForTenant(HERO_SLIDES_KEY, tenantId), slides);
    return ok(slides, 'Hero slides saved');
  }

  if (ctx.path === '/social-media' && ctx.method === 'PUT') {
    const body = (ctx.body ?? {}) as { tenantId?: string; links?: Array<{ id?: string; type: number; url: string }> };
    const tenantId = body.tenantId ?? ctx.tenantId;
    if (!tenantId) return fail('No tenant selected.', 400);
    const record: SocialMediaRecord = {
      tenantId,
      links: (body.links ?? []).map((l) => ({ id: l.id ?? db.newId(), type: l.type, url: l.url }))
    };
    db.saveObject(collectionForTenant(SOCIAL_MEDIA_KEY, tenantId), record);
    return ok(record, 'Social media saved');
  }

  if (ctx.path.startsWith('/website')) {
    const tenantIdFromQuery = ctx.query.get('tenantId') ?? ctx.tenantId;

    if (ctx.path === '/website/publish' && ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as {
        tenantId?: string; slug?: string; published?: boolean;
        ctaLabel?: string | null; ctaType?: string | null; ctaTarget?: string | null;
      };
      const tenantId = body.tenantId ?? ctx.tenantId;
      if (!tenantId) return fail('No tenant selected.', 400);
      const slug = (body.slug ?? '').trim();
      if (body.published && !slug) return fail('A store URL is required to publish.', 400);

      const index = getSlugIndex(db);
      if (slug && index[slug] && index[slug] !== tenantId) {
        return fail('That store URL is already taken.', 409);
      }
      // Drop any slug this tenant previously held before claiming the new one.
      for (const key of Object.keys(index)) {
        if (index[key] === tenantId) delete index[key];
      }
      if (slug) index[slug] = tenantId;
      saveSlugIndex(db, index);

      const existing = getWebsite(db, tenantId);
      const site: WebsiteRecord = {
        slug: slug || existing?.slug || '',
        published: Boolean(body.published),
        updatedAt: new Date().toISOString(),
        ctaLabel: body.ctaLabel ?? existing?.ctaLabel ?? null,
        ctaType: body.ctaType ?? existing?.ctaType ?? null,
        ctaTarget: body.ctaTarget ?? existing?.ctaTarget ?? null,
        sections: existing?.sections ?? [],
        theme: existing?.theme ?? null
      };
      saveWebsite(db, tenantId, site);
      return ok(true, site.published ? 'Website published' : 'Website unpublished');
    }

    if (ctx.path === '/website/theme' && ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as { tenantId?: string; presetId?: string | null; overrides?: Record<string, unknown> | null };
      const tenantId = body.tenantId ?? ctx.tenantId;
      if (!tenantId) return fail('No tenant selected.', 400);
      const existing = getWebsite(db, tenantId);
      const site: WebsiteRecord = {
        slug: existing?.slug ?? '', published: existing?.published ?? false, updatedAt: new Date().toISOString(),
        ctaLabel: existing?.ctaLabel ?? null, ctaType: existing?.ctaType ?? null, ctaTarget: existing?.ctaTarget ?? null,
        sections: existing?.sections ?? [],
        theme: { presetId: body.presetId ?? null, overrides: body.overrides ?? null }
      };
      saveWebsite(db, tenantId, site);
      return ok(true, 'Theme saved');
    }

    if (ctx.path === '/website/sections/reorder' && ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as { tenantId?: string; sectionTypes?: string[] };
      const tenantId = body.tenantId ?? ctx.tenantId;
      if (!tenantId) return fail('No tenant selected.', 400);
      const existing = getWebsite(db, tenantId);
      if (existing) {
        const order = body.sectionTypes ?? [];
        existing.sections = existing.sections
          .map((s) => ({ ...s, displayOrder: order.indexOf(s.sectionType) }))
          .sort((a, b) => a.displayOrder - b.displayOrder);
        saveWebsite(db, tenantId, existing);
      }
      return ok(true, 'Sections reordered');
    }

    const sectionDeleteMatch = ctx.path.match(/^\/website\/sections\/([^/]+)$/);
    if (sectionDeleteMatch && ctx.method === 'DELETE') {
      const tenantId = tenantIdFromQuery;
      if (!tenantId) return fail('No tenant selected.', 400);
      const existing = getWebsite(db, tenantId);
      if (existing) {
        existing.sections = existing.sections.filter((s) => s.sectionType !== decodeURIComponent(sectionDeleteMatch[1]));
        saveWebsite(db, tenantId, existing);
      }
      return ok(true, 'Section deleted');
    }

    if (ctx.path === '/website/sections' && ctx.method === 'GET') {
      const tenantId = tenantIdFromQuery;
      if (!tenantId) return ok([]);
      return ok(getWebsite(db, tenantId)?.sections ?? []);
    }

    if (ctx.path === '/website/sections' && ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as {
        tenantId?: string; sectionType: string; enabled?: boolean; title?: string | null;
        layoutStyle?: string | null; itemLimit?: number | null; contentJson: Record<string, unknown>;
      };
      const tenantId = body.tenantId ?? ctx.tenantId;
      if (!tenantId) return fail('No tenant selected.', 400);
      const existing = getWebsite(db, tenantId) ?? {
        slug: '', published: false, updatedAt: new Date().toISOString(),
        ctaLabel: null, ctaType: null, ctaTarget: null, sections: [], theme: null
      };
      const idx = existing.sections.findIndex((s) => s.sectionType === body.sectionType);
      const section: WebsiteSectionRecord = {
        id: idx >= 0 ? existing.sections[idx].id : db.newId(),
        sectionType: body.sectionType,
        enabled: body.enabled ?? true,
        title: body.title ?? null,
        displayOrder: idx >= 0 ? existing.sections[idx].displayOrder : existing.sections.length,
        contentJson: JSON.stringify(body.contentJson ?? {})
      };
      if (idx >= 0) existing.sections[idx] = section; else existing.sections.push(section);
      saveWebsite(db, tenantId, existing);
      return ok(section, 'Section saved');
    }

    if (ctx.path === '/website' && ctx.method === 'GET') {
      const tenantId = tenantIdFromQuery;
      if (!tenantId) return ok(null);
      return ok(getWebsite(db, tenantId));
    }
  }

  return null;
}
