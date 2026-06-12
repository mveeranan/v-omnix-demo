import { Injectable, inject, signal, computed } from '@angular/core';
import { finalize, take } from 'rxjs';
import { NotificationService } from '../../../core/notifications/notification.service';
import { WebsiteSectionId, WEBSITE_CONTENT_SECTIONS } from '../models/website-section.ids';
import {
  Portfolio,
  PortfolioBrand,
  PortfolioCta,
  PortfolioFeaturedProducts,
  PortfolioHero,
  PortfolioHighlights,
  PortfolioNewsletter,
  PortfolioOfferBanner,
  PortfolioReview,
  PortfolioSaleCollection,
  PortfolioSocial,
  PortfolioStoreDescription,
  PortfolioTheme
} from '../models/portfolio.model';
import { PortfolioStateService } from './portfolio-state.service';
import {
  validateBrand,
  validateContactSupport,
  validateFeaturedProducts,
  validatePublish,
  validateReviews,
  validateStoreDescription
} from './website-section.validators';

export interface SectionMeta {
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

export interface BrandSectionBuffer {
  brand: PortfolioBrand;
  primaryColor: string;
}

export interface ReviewsSectionBuffer {
  reviewsSection: Portfolio['reviewsSection'];
  reviews: PortfolioReview[];
}

export interface SocialSectionBuffer {
  socialSection: Portfolio['socialSection'];
  social: PortfolioSocial;
}

export interface PublishSectionBuffer {
  slug: string;
  cta: PortfolioCta;
  published: boolean;
}

export type SectionBuffer =
  | BrandSectionBuffer
  | PortfolioHero
  | PortfolioStoreDescription
  | PortfolioFeaturedProducts
  | PortfolioOfferBanner
  | PortfolioSaleCollection
  | ReviewsSectionBuffer
  | PortfolioHighlights
  | Portfolio['contactSupport']
  | PortfolioNewsletter
  | SocialSectionBuffer
  | PortfolioTheme
  | PublishSectionBuffer;

const DEFAULT_META: SectionMeta = {
  editing: false,
  dirty: false,
  saving: false,
  lastSavedAt: null,
  error: null
};

@Injectable({ providedIn: 'root' })
export class WebsiteSectionStateService {
  private readonly portfolioState = inject(PortfolioStateService);
  private readonly notifications = inject(NotificationService);

  private readonly meta = signal<Record<WebsiteSectionId, SectionMeta>>(this.createInitialMeta());
  private readonly buffers = signal<Partial<Record<WebsiteSectionId, SectionBuffer>>>({});

  readonly anyDirty = computed(
    () =>
      WEBSITE_CONTENT_SECTIONS.some((id) => this.meta()[id]?.dirty) ||
      this.meta().theme?.dirty ||
      this.meta().publish?.dirty
  );

  readonly dirtyCount = computed(() => {
    const m = this.meta();
    return (WEBSITE_CONTENT_SECTIONS as WebsiteSectionId[])
      .concat(['theme', 'publish'])
      .filter((id) => m[id]?.dirty).length;
  });

  sectionMeta(id: WebsiteSectionId): SectionMeta {
    return this.meta()[id] ?? DEFAULT_META;
  }

  isEditing(id: WebsiteSectionId): boolean {
    return this.meta()[id]?.editing ?? false;
  }

  buffer<T extends SectionBuffer>(id: WebsiteSectionId): T | null {
    return (this.buffers()[id] as T) ?? null;
  }

  beginEdit(id: WebsiteSectionId): void {
    const draft = this.portfolioState.draft();
    if (!draft) return;
    const buffer = this.extractSlice(id, draft);
    this.buffers.update((b) => ({ ...b, [id]: structuredClone(buffer) }));
    this.patchMeta(id, { editing: true, dirty: false, error: null });
  }

  patchBuffer<T extends SectionBuffer>(id: WebsiteSectionId, updater: (current: T) => T): void {
    const current = this.buffers()[id] as T | undefined;
    if (!current) return;
    this.buffers.update((b) => ({ ...b, [id]: updater(structuredClone(current)) }));
    this.patchMeta(id, { dirty: true, error: null });
  }

  cancelSection(id: WebsiteSectionId): void {
    this.buffers.update((b) => {
      const next = { ...b };
      delete next[id];
      return next;
    });
    this.patchMeta(id, { editing: false, dirty: false, error: null });
  }

  resetSection(id: WebsiteSectionId): void {
    const draft = this.portfolioState.draft();
    if (!draft || !this.isEditing(id)) return;
    const buffer = this.extractSlice(id, draft);
    this.buffers.update((b) => ({ ...b, [id]: structuredClone(buffer) }));
    this.patchMeta(id, { dirty: false, error: null });
    this.notifications.info('Section reset', 'Restored to last saved values.');
  }

  saveSection(id: WebsiteSectionId): void {
    const buffer = this.buffers()[id];
    const draft = this.portfolioState.draft();
    if (!buffer || !draft || this.meta()[id]?.saving) return;

    const validation = this.validateSection(id, buffer);
    if (!validation.valid) {
      this.patchMeta(id, { error: validation.errors.join(' ') });
      return;
    }

    this.patchMeta(id, { saving: true, error: null });
    const partial = this.bufferToPartial(id, buffer);

    this.portfolioState
      .commitAndSave(partial)
      .pipe(
        take(1),
        finalize(() => this.patchMeta(id, { saving: false }))
      )
      .subscribe({
        next: () => {
          this.buffers.update((b) => {
            const next = { ...b };
            delete next[id];
            return next;
          });
          this.patchMeta(id, {
            editing: false,
            dirty: false,
            lastSavedAt: new Date(),
            error: null
          });
          this.notifications.success('Section saved');
        },
        error: () => {
          this.patchMeta(id, { error: 'Could not save section. Try again.' });
        }
      });
  }

  private validateSection(id: WebsiteSectionId, buffer: SectionBuffer) {
    switch (id) {
      case 'brand': {
        const b = buffer as BrandSectionBuffer;
        return validateBrand(b.brand, b.primaryColor);
      }
      case 'storeDescription':
        return validateStoreDescription(buffer as PortfolioStoreDescription);
      case 'featuredProducts':
        return validateFeaturedProducts(buffer as PortfolioFeaturedProducts);
      case 'reviews': {
        const r = buffer as ReviewsSectionBuffer;
        return validateReviews(r.reviewsSection, r.reviews);
      }
      case 'contactSupport':
        return validateContactSupport(buffer as Portfolio['contactSupport']);
      case 'hero':
      case 'offerBanner':
      case 'saleCollection':
      case 'whyChooseUs':
      case 'newsletter':
      case 'social':
      case 'theme':
        return { valid: true, errors: [] };
      case 'publish':
        return validatePublish((buffer as PublishSectionBuffer).slug);
      default:
        return { valid: true, errors: [] };
    }
  }

  private extractSlice(id: WebsiteSectionId, draft: Portfolio): SectionBuffer {
    switch (id) {
      case 'brand':
        return { brand: structuredClone(draft.brand), primaryColor: draft.theme.primaryColor };
      case 'hero':
        return structuredClone(draft.hero);
      case 'storeDescription':
        return structuredClone(draft.storeDescription);
      case 'featuredProducts':
        return structuredClone(draft.featuredProducts);
      case 'offerBanner':
        return structuredClone(draft.offerBanner);
      case 'saleCollection':
        return structuredClone(draft.saleCollection);
      case 'reviews':
        return {
          reviewsSection: structuredClone(draft.reviewsSection),
          reviews: structuredClone(draft.reviews)
        };
      case 'whyChooseUs':
        return structuredClone(draft.highlights);
      case 'contactSupport':
        return structuredClone(draft.contactSupport);
      case 'newsletter':
        return structuredClone(draft.newsletter);
      case 'social':
        return {
          socialSection: structuredClone(draft.socialSection),
          social: structuredClone(draft.social)
        };
      case 'theme':
        return structuredClone(draft.theme);
      case 'publish':
        return { slug: draft.slug, cta: structuredClone(draft.cta), published: draft.published };
      default: {
        const _exhaustive: never = id;
        return _exhaustive;
      }
    }
  }

  private bufferToPartial(id: WebsiteSectionId, buffer: SectionBuffer): Partial<Portfolio> {
    const draft = this.portfolioState.draft()!;
    switch (id) {
      case 'brand': {
        const b = buffer as BrandSectionBuffer;
        return { brand: b.brand, theme: { ...draft.theme, primaryColor: b.primaryColor } };
      }
      case 'hero':
        return { hero: buffer as PortfolioHero };
      case 'storeDescription': {
        const sd = buffer as PortfolioStoreDescription;
        return {
          storeDescription: sd,
          about: { ...draft.about, enabled: sd.enabled, description: sd.description }
        };
      }
      case 'featuredProducts':
        return { featuredProducts: buffer as PortfolioFeaturedProducts };
      case 'offerBanner':
        return { offerBanner: buffer as PortfolioOfferBanner };
      case 'saleCollection':
        return { saleCollection: buffer as PortfolioSaleCollection };
      case 'reviews': {
        const r = buffer as ReviewsSectionBuffer;
        return { reviewsSection: r.reviewsSection, reviews: r.reviews };
      }
      case 'whyChooseUs':
        return { highlights: buffer as PortfolioHighlights };
      case 'contactSupport': {
        const cs = buffer as Portfolio['contactSupport'];
        return {
          contactSupport: cs,
          contact: { ...draft.contact, enabled: cs.enabled, email: cs.email, phone: cs.phone }
        };
      }
      case 'newsletter':
        return { newsletter: buffer as PortfolioNewsletter };
      case 'social': {
        const s = buffer as SocialSectionBuffer;
        return { socialSection: s.socialSection, social: s.social };
      }
      case 'theme':
        return { theme: buffer as PortfolioTheme };
      case 'publish': {
        const p = buffer as PublishSectionBuffer;
        return { slug: p.slug, cta: p.cta, published: p.published };
      }
      default:
        return {};
    }
  }

  private patchMeta(id: WebsiteSectionId, patch: Partial<SectionMeta>): void {
    this.meta.update((m) => ({
      ...m,
      [id]: { ...DEFAULT_META, ...m[id], ...patch }
    }));
  }

  private createInitialMeta(): Record<WebsiteSectionId, SectionMeta> {
    const ids: WebsiteSectionId[] = [...WEBSITE_CONTENT_SECTIONS, 'theme', 'publish'];
    return ids.reduce(
      (acc, id) => {
        acc[id] = { ...DEFAULT_META };
        return acc;
      },
      {} as Record<WebsiteSectionId, SectionMeta>
    );
  }
}
