import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, finalize, map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { WebsiteSectionId, WEBSITE_CONTENT_SECTIONS } from '../models/website-section.ids';
import {
  buildWebsitePublishRequest,
  buildWebsiteSectionSaveRequest
} from '../models/website-api.model';
import {
  Portfolio,
  PortfolioBrand,
  PortfolioCta,
  PortfolioCategoryShowcase,
  PortfolioHero,
  PortfolioHighlights,
  PortfolioSocial,
  PortfolioStats,
  PortfolioStoreDescription,
  PortfolioTheme,
  PortfolioAnnouncementBar,
  PortfolioFaq,
  PortfolioNewArrivals,
  PortfolioBrandStrip,
  PortfolioTrustBadges,
  PortfolioDealOfWeek,
  PortfolioFeaturedProducts,
  PortfolioReviewsSection,
  PortfolioGallerySection,
  PortfolioGalleryItem,
  PortfolioNewsletter
} from '../models/portfolio.model';
import { PortfolioStateService } from './portfolio-state.service';
import { WebsiteApiService } from './website-api.service';
import {
  BrandBusinessProfileService,
  BrandPendingUploads
} from './brand-business-profile.service';
import { ThemePresetsService } from './theme-presets.service';
import { HeroSlidesService } from './hero-slides.service';
import { SocialMediaService } from './social-media.service';
import { DocumentUploadService } from '../../admin/data-access/document-upload.service';
import { applyBusinessProfileToPortfolioPartial } from './business-profile-portfolio.util';
import { HeroSlidePendingUploads } from './hero-slides-portfolio.util';
import {
  validateBrand,
  validateContactSupport,
  validatePublish,
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
  presetId: string;
  storeDescription: PortfolioStoreDescription;
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

export interface GallerySectionBuffer {
  gallerySection: PortfolioGallerySection;
  gallery: PortfolioGalleryItem[];
}

export type SectionBuffer =
  | BrandSectionBuffer
  | PortfolioHero
  | PortfolioCategoryShowcase
  | PortfolioHighlights
  | PortfolioStats
  | Portfolio['contactSupport']
  | SocialSectionBuffer
  | PortfolioTheme
  | PublishSectionBuffer
  | PortfolioAnnouncementBar
  | PortfolioFaq
  | PortfolioNewArrivals
  | PortfolioBrandStrip
  | PortfolioTrustBadges
  | PortfolioDealOfWeek
  | PortfolioFeaturedProducts
  | PortfolioReviewsSection
  | GallerySectionBuffer
  | PortfolioNewsletter;

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
  private readonly websiteApi = inject(WebsiteApiService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly brandBusinessProfile = inject(BrandBusinessProfileService);
  private readonly themePresets = inject(ThemePresetsService);
  private readonly heroSlidesService = inject(HeroSlidesService);
  private readonly socialMediaService = inject(SocialMediaService);
  private readonly documentUpload = inject(DocumentUploadService);

  private readonly brandPendingUploads = signal<BrandPendingUploads>({
    logoFile: null,
    storyImageFile: null,
    logoDocumentId: null,
    coverDocumentId: null
  });

  private readonly heroPendingUploads = signal<HeroSlidePendingUploads>({ slideFiles: {} });

  private readonly meta = signal<Record<WebsiteSectionId, SectionMeta>>(this.createInitialMeta());
  private readonly buffers = signal<Partial<Record<WebsiteSectionId, SectionBuffer>>>({});

  readonly anyDirty = computed(
    () =>
      WEBSITE_CONTENT_SECTIONS.some((id) => this.meta()[id]?.dirty) ||
      this.meta().publish?.dirty
  );

  readonly dirtyCount = computed(() => {
    const m = this.meta();
    return (WEBSITE_CONTENT_SECTIONS as WebsiteSectionId[])
      .concat(['publish'])
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

    if (id === 'brand') {
      this.resetBrandPendingUploads();
      const cached = this.portfolioState.businessProfile();
      if (cached) {
        this.brandPendingUploads.update((pending) => ({
          ...pending,
          logoDocumentId: cached.logoDocumentId ?? null,
          coverDocumentId: cached.coverImageDocumentId ?? null
        }));
        return;
      }

      const tenantId = this.brandBusinessProfile.resolveTenantId();
      if (tenantId) {
        this.brandBusinessProfile.getExistingProfile(tenantId).subscribe({
          next: (profile) => {
            this.brandPendingUploads.update((pending) => ({
              ...pending,
              logoDocumentId: profile?.logoDocumentId ?? null,
              coverDocumentId: profile?.coverImageDocumentId ?? null
            }));
          },
          error: () => undefined
        });
      }
    }

    if (id === 'hero') {
      this.resetHeroPendingUploads();
    }
  }

  setHeroPendingSlideFile(slideId: string, file: File | null): void {
    this.heroPendingUploads.update((pending) => {
      const slideFiles = { ...pending.slideFiles };
      if (file) {
        slideFiles[slideId] = file;
      } else {
        delete slideFiles[slideId];
      }
      return { slideFiles };
    });
  }

  clearHeroPendingSlide(slideId: string): void {
    this.setHeroPendingSlideFile(slideId, null);
  }

  clearHeroSlideImage(slideId: string): void {
    const hero = this.buffer<PortfolioHero>('hero');
    const slide = hero?.slides?.find((item) => item.id === slideId);
    this.deleteDocumentIfExists(slide?.imageDocumentId);
    this.clearHeroPendingSlide(slideId);
    this.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: (b.slides ?? []).map((item) =>
        item.id === slideId ? { ...item, imageUrl: '', imageDocumentId: undefined } : item
      )
    }));
  }

  removeHeroSlide(slideId: string): void {
    const hero = this.buffer<PortfolioHero>('hero');
    const slide = hero?.slides?.find((item) => item.id === slideId);
    this.deleteDocumentIfExists(slide?.imageDocumentId);
    this.clearHeroPendingSlide(slideId);
    this.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: (b.slides ?? [])
        .filter((item) => item.id !== slideId)
        .map((item, index) => ({ ...item, sortOrder: index }))
    }));
  }

  private deleteDocumentIfExists(documentId: string | null | undefined): void {
    const id = documentId?.trim();
    if (!id) {
      return;
    }
    this.documentUpload.delete(id).subscribe({
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Could not delete file.';
        this.notifications.warning(message);
      }
    });
  }

  private resetHeroPendingUploads(): void {
    this.heroPendingUploads.set({ slideFiles: {} });
  }

  setBrandPendingLogo(file: File | null): void {
    this.brandPendingUploads.update((p) => ({ ...p, logoFile: file }));
  }

  setBrandPendingStoryImage(file: File | null): void {
    this.brandPendingUploads.update((p) => ({ ...p, storyImageFile: file }));
  }

  clearBrandPendingLogo(): void {
    this.deleteDocumentIfExists(this.brandPendingUploads().logoDocumentId);
    this.brandPendingUploads.update((p) => ({
      ...p,
      logoFile: null,
      logoDocumentId: null
    }));
  }

  clearBrandPendingStoryImage(): void {
    this.deleteDocumentIfExists(this.brandPendingUploads().coverDocumentId);
    this.brandPendingUploads.update((p) => ({
      ...p,
      storyImageFile: null,
      coverDocumentId: null
    }));
  }

  private resetBrandPendingUploads(): void {
    this.brandPendingUploads.set({
      logoFile: null,
      storyImageFile: null,
      logoDocumentId: null,
      coverDocumentId: null
    });
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
    const tenantId = this.authService.resolveTenantId();

    if (!tenantId) {
      this.patchMeta(id, {
        saving: false,
        error: 'No tenant selected. Please log in again.'
      });
      return;
    }

    const save$ = this.persistSection(id, buffer, partial, tenantId).pipe(
      switchMap(() => this.portfolioState.syncFromPortfolioApi()),
      map(() => void 0)
    );

    save$
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
          if (id === 'brand') {
            this.resetBrandPendingUploads();
          }
          if (id === 'hero') {
            this.resetHeroPendingUploads();
          }
          this.patchMeta(id, {
            editing: false,
            dirty: false,
            lastSavedAt: new Date(),
            error: null
          });
          this.notifications.success('Section saved');
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : '';
          if (!this.meta()[id]?.error) {
            this.patchMeta(id, {
              error: message || 'Could not save section. Try again.'
            });
          }
        }
      });
  }

  private persistSection(
    id: WebsiteSectionId,
    buffer: SectionBuffer,
    partial: Partial<Portfolio>,
    tenantId: string
  ): Observable<void> {
    if (id === 'brand') {
      const brandBuffer = buffer as BrandSectionBuffer;
      return this.themePresets.list().pipe(
        switchMap(() => this.brandBusinessProfile.getExistingProfile(tenantId)),
        switchMap((existing) =>
          this.brandBusinessProfile
            .upsertFromBrandBuffer(brandBuffer, this.brandPendingUploads(), existing)
            .pipe(
              map((profile) => {
                const presetId = profile.presetId?.trim() || brandBuffer.presetId?.trim();
                const profileWithPreset = presetId ? { ...profile, presetId } : profile;
                const merged = applyBusinessProfileToPortfolioPartial(
                  partial,
                  profileWithPreset,
                  this.themePresets.getCatalog()
                );
                this.portfolioState.applyDraftPartial(merged);
              })
            )
        ),
        catchError((err: Error) => {
          this.patchMeta(id, { error: err.message || 'Could not save brand.' });
          return throwError(() => err);
        })
      );
    }

    if (id === 'hero') {
      const heroBuffer = buffer as PortfolioHero;
      return this.heroSlidesService.upsertFromHeroBuffer(heroBuffer, this.heroPendingUploads()).pipe(
        map(() => void 0),
        catchError((err: Error) => {
          this.patchMeta(id, { error: err.message || 'Could not save hero slideshow.' });
          return throwError(() => err);
        })
      );
    }

    if (id === 'social') {
      const socialBuffer = buffer as SocialSectionBuffer;
      return this.socialMediaService.upsertFromSocialBuffer(socialBuffer.social).pipe(
        map(() => void 0),
        catchError((err: Error) => {
          this.patchMeta(id, { error: err.message || 'Could not save social links.' });
          return throwError(() => err);
        })
      );
    }

    this.portfolioState.applyDraftPartial(partial);

    if (id === 'publish') {
      return this.websiteApi.publish(
        buildWebsitePublishRequest(tenantId, buffer as PublishSectionBuffer)
      );
    }

    if (WEBSITE_CONTENT_SECTIONS.includes(id)) {
      return this.websiteApi.saveSection(
        buildWebsiteSectionSaveRequest(tenantId, id, partial)
      );
    }

    return of(void 0);
  }

  private validateSection(id: WebsiteSectionId, buffer: SectionBuffer) {
    switch (id) {
      case 'brand': {
        const b = buffer as BrandSectionBuffer;
        const brandValidation = validateBrand(b.brand, b.presetId);
        if (!brandValidation.valid) return brandValidation;
        return validateStoreDescription(b.storeDescription);
      }
      case 'contactSupport':
        return validateContactSupport(buffer as Portfolio['contactSupport']);
      case 'publish':
        return validatePublish((buffer as PublishSectionBuffer).slug);
      default:
        return { valid: true, errors: [] };
    }
  }

  private extractSlice(id: WebsiteSectionId, draft: Portfolio): SectionBuffer {
    switch (id) {
      case 'brand':
        return {
          brand: structuredClone(draft.brand),
          presetId: draft.theme.presetId,
          storeDescription: structuredClone(draft.storeDescription)
        };
      case 'hero': {
        const hero = structuredClone(draft.hero);
        return { ...hero, slides: hero.slides ?? [] };
      }
      case 'categoryShowcase':
        return structuredClone(draft.categoryShowcase);
      case 'whyChooseUs':
        return structuredClone(draft.highlights);
      case 'stats':
        return structuredClone(draft.stats);
      case 'contactSupport':
        return structuredClone(draft.contactSupport);
      case 'social':
        return {
          socialSection: structuredClone(draft.socialSection),
          social: structuredClone(draft.social)
        };
      case 'theme':
        return structuredClone(draft.theme);
      case 'publish':
        return { slug: draft.slug, cta: structuredClone(draft.cta), published: draft.published };
      case 'announcementBar':
        return structuredClone(draft.announcementBar);
      case 'faq':
        return structuredClone(draft.faq);
      case 'newArrivals':
        return structuredClone(draft.newArrivals);
      case 'brandStrip':
        return structuredClone(draft.brandStrip);
      case 'trustBadges':
        return structuredClone(draft.trustBadges);
      case 'dealOfWeek':
        return structuredClone(draft.dealOfWeek);
      case 'featuredProducts':
        return structuredClone(draft.featuredProducts);
      case 'reviewsSection':
        return structuredClone(draft.reviewsSection);
      case 'gallerySection':
        return {
          gallerySection: structuredClone(draft.gallerySection),
          gallery: structuredClone(draft.gallery)
        };
      case 'newsletter':
        return structuredClone(draft.newsletter);
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
        const sd = b.storeDescription;
        return {
          brand: b.brand,
          storeDescription: sd,
          about: { ...draft.about, enabled: sd.enabled, description: sd.description }
        };
      }
      case 'hero':
        return { hero: buffer as PortfolioHero };
      case 'categoryShowcase':
        return { categoryShowcase: buffer as PortfolioCategoryShowcase };
      case 'whyChooseUs':
        return { highlights: buffer as PortfolioHighlights };
      case 'stats':
        return { stats: buffer as PortfolioStats };
      case 'contactSupport': {
        const cs = buffer as Portfolio['contactSupport'];
        return {
          contactSupport: cs,
          contact: { ...draft.contact, enabled: cs.enabled, email: cs.email, phone: cs.phone }
        };
      }
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
      case 'announcementBar':
        return { announcementBar: buffer as PortfolioAnnouncementBar };
      case 'faq':
        return { faq: buffer as PortfolioFaq };
      case 'newArrivals':
        return { newArrivals: buffer as PortfolioNewArrivals };
      case 'brandStrip':
        return { brandStrip: buffer as PortfolioBrandStrip };
      case 'trustBadges':
        return { trustBadges: buffer as PortfolioTrustBadges };
      case 'dealOfWeek':
        return { dealOfWeek: buffer as PortfolioDealOfWeek };
      case 'featuredProducts':
        return { featuredProducts: buffer as PortfolioFeaturedProducts };
      case 'reviewsSection':
        return { reviewsSection: buffer as PortfolioReviewsSection };
      case 'gallerySection': {
        const g = buffer as GallerySectionBuffer;
        return { gallerySection: g.gallerySection, gallery: g.gallery };
      }
      case 'newsletter':
        return { newsletter: buffer as PortfolioNewsletter };
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
