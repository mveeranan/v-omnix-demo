import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, tap, map, switchMap } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioService } from './portfolio.service';
import { PortfolioTenantStateService } from './portfolio-tenant-state.service';
import { PortfolioLoadResult } from '../models/dto/portfolio-load-result.dto';
import { WebsiteApiService } from './website-api.service';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { AdminDashboardDataService } from '../../admin/services/admin-dashboard-data.service';
import { mergeBusinessProfileIntoPortfolio } from './business-profile-portfolio.util';
import { mergeHeroSlidesIntoPortfolio } from './hero-slides-portfolio.util';
import { mergeSocialMediaIntoPortfolio } from './social-media-portfolio.util';
import { hasBusinessProfileData } from '../../admin/models/business-profile.model';
import { ThemePresetsService } from './theme-presets.service';
import { mergeWithWebsiteDefaults, createDefaultWebsitePortfolio } from '../models/portfolio-defaults';
import { buildWebsitePublishRequest } from '../models/website-api.model';

@Injectable({ providedIn: 'root' })
export class PortfolioStateService {
  private readonly portfolioService = inject(PortfolioService);
  private readonly tenantState = inject(PortfolioTenantStateService);
  private readonly websiteApi = inject(WebsiteApiService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly dashboardData = inject(AdminDashboardDataService);
  private readonly themePresets = inject(ThemePresetsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly draft = signal<Portfolio | null>(null);
  readonly businessProfile = computed(() => this.tenantState.businessProfile());
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly lastSavedAt = signal<Date | null>(null);

  readonly hasGalleryItems = computed(() => (this.draft()?.gallery.length ?? 0) > 0);

  loadDraft(): void {
    this.isLoading.set(true);

    this.themePresets
      .list()
      .pipe(
        switchMap(() => this.tenantState.refresh()),
        map((aggregate) => this.buildDraftFromAggregate(this.enrichAggregate(aggregate))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (portfolio) => {
          this.draft.set(portfolio);
          this.isLoading.set(false);
          this.portfolioService.saveDraft(portfolio).subscribe({ error: () => undefined });
        },
        error: (err) => {
          console.error('Failed to load portfolio draft:', err);
          // Load default/fallback portfolio so editor is still usable
          const defaultPortfolio = createDefaultWebsitePortfolio();
          this.draft.set(defaultPortfolio);
          this.isLoading.set(false);
          this.notifications.error('Could not load all website data. Loading defaults. Changes may not sync.');
        }
      });
  }

  applyDraftPartial(partial: Partial<Portfolio>): void {
    const current = this.draft();
    if (!current) {
      return;
    }
    const next = this.mergePartial(current, partial);
    this.draft.set(next);
  }

  /** Re-fetch GET /portfolio/{tenantId} and merge server data into the editor draft. */
  syncFromPortfolioApi(): Observable<Portfolio> {
    return this.themePresets.list().pipe(switchMap(() => this.reloadFromPortfolioApi()));
  }

  /** Portfolio GET only (no theme-presets prefetch). Rebuilds editor draft from server data. */
  reloadFromPortfolioApi(): Observable<Portfolio> {
    return this.tenantState.refresh().pipe(
      map((aggregate) => {
        const portfolio = this.buildDraftFromAggregate(this.enrichAggregate(aggregate));
        this.draft.set(portfolio);
        this.lastSavedAt.set(new Date());
        return portfolio;
      }),
      tap((portfolio) => {
        this.portfolioService.saveDraft(portfolio).subscribe({ error: () => undefined });
      })
    );
  }

  private enrichAggregate(aggregate: PortfolioLoadResult): PortfolioLoadResult {
    return {
      ...aggregate,
      heroSlides: aggregate.heroSlides ?? this.tenantState.heroSlides(),
      socialMedia: aggregate.socialMedia ?? this.tenantState.socialMedia(),
      portfolio: aggregate.portfolio ?? this.tenantState.portfolio()
    };
  }

  /** Build editor draft from GET /portfolio — server is source of truth, not local draft. */
  private buildDraftFromAggregate(aggregate: PortfolioLoadResult): Portfolio {
    return this.mergeAggregateIntoDraft(aggregate);
  }

  private mergeAggregateIntoDraft(aggregate: PortfolioLoadResult): Portfolio {
    let merged = aggregate.portfolio ?? createDefaultWebsitePortfolio();

    const catalog = this.themePresets.getCatalog();
    const profile = aggregate.businessProfile;
    if (profile && hasBusinessProfileData(profile)) {
      merged = mergeBusinessProfileIntoPortfolio(merged, profile, catalog);
    }

    const presetId = aggregate.presetId?.trim() || profile?.presetId?.trim();
    if (presetId) {
      // Resolve preset tokens, then re-apply per-tenant overrides saved on the server
      // (they arrive on the portfolio theme node as `overrides`).
      const overrides = merged.theme?.overrides;
      const resolved = this.themePresets.resolvePortfolioTheme(presetId);
      merged = {
        ...merged,
        theme: {
          ...resolved,
          ...((overrides ?? {}) as Partial<typeof resolved>),
          presetId,
          overrides
        }
      };
    }

    merged = mergeWithWebsiteDefaults(merged);

    merged = mergeHeroSlidesIntoPortfolio(merged, aggregate.heroSlides ?? [], { force: true });

    merged = mergeSocialMediaIntoPortfolio(merged, aggregate.socialMedia, { force: true });

    return merged;
  }

  private refreshTenantAggregate(): void {
    this.syncFromPortfolioApi().subscribe({ error: () => undefined });
  }

  commitAndSave(partial: Partial<Portfolio>): Observable<Portfolio> {
    const current = this.draft();
    if (!current) {
      throw new Error('No draft loaded');
    }

    const next = this.mergePartial(current, partial);
    this.draft.set(next);

    if (this.isSaving()) {
      return new Observable((subscriber) => {
        subscriber.next(next);
        subscriber.complete();
      });
    }

    this.isSaving.set(true);
    return this.portfolioService.saveDraft(next).pipe(
      tap({
        next: (saved) => {
          this.draft.set(saved);
          this.isSaving.set(false);
          this.lastSavedAt.set(new Date());
          if (saved.gallery.length > 0) {
            this.dashboardData.markPortfolioUploaded();
          }
          this.refreshTenantAggregate();
        },
        error: () => {
          this.isSaving.set(false);
        }
      })
    );
  }

  publish(): void {
    if (this.isSaving()) {
      return;
    }

    const current = this.draft();
    const tenantId = this.authService.resolveTenantId();
    if (!current?.slug?.trim()) {
      this.notifications.warning('Set a store URL slug before publishing.');
      return;
    }
    if (!tenantId) {
      this.notifications.error('No tenant selected. Please log in again.');
      return;
    }

    this.isSaving.set(true);
    this.websiteApi
      .publish(
        buildWebsitePublishRequest(tenantId, {
          slug: current.slug,
          published: true,
          cta: current.cta
        })
      )
      .pipe(
        switchMap(() => this.syncFromPortfolioApi()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (published) => {
          this.isSaving.set(false);
          if (published) {
            this.notifications.success('Store published!', `Live at /store/${published.slug}`);
          }
        },
        error: () => {
          this.isSaving.set(false);
          this.notifications.error('Could not publish store.');
        }
      });
  }

  private mergePartial(current: Portfolio, partial: Partial<Portfolio>): Portfolio {
    const next = structuredClone(current);
    if (partial.brand) next.brand = partial.brand;
    if (partial.hero) {
      next.hero = {
        ...partial.hero,
        slides: partial.hero.slides ?? next.hero.slides ?? []
      };
    }
    if (partial.categoryShowcase) next.categoryShowcase = partial.categoryShowcase;
    if (partial.lookbook) next.lookbook = partial.lookbook;
    if (partial.promoStrip) next.promoStrip = partial.promoStrip;
    if (partial.stats) next.stats = partial.stats;
    if (partial.offerBanner) next.offerBanner = partial.offerBanner;
    if (partial.saleCollection) next.saleCollection = partial.saleCollection;
    if (partial.storeDescription) {
      next.storeDescription = partial.storeDescription;
      next.about = {
        ...next.about,
        enabled: partial.storeDescription.enabled,
        description: partial.storeDescription.description
      };
    }
    if (partial.gallerySection) next.gallerySection = partial.gallerySection;
    if (partial.gallery) next.gallery = partial.gallery;
    if (partial.featuredProducts) next.featuredProducts = partial.featuredProducts;
    if (partial.reviewsSection) next.reviewsSection = partial.reviewsSection;
    if (partial.reviews) next.reviews = partial.reviews;
    if (partial.contactSupport) {
      next.contactSupport = partial.contactSupport;
      next.contact = {
        ...next.contact,
        enabled: partial.contactSupport.enabled,
        email: partial.contactSupport.email,
        phone: partial.contactSupport.phone
      };
    }
    if (partial.paymentMethods) next.paymentMethods = partial.paymentMethods;
    if (partial.storePolicies) next.storePolicies = partial.storePolicies;
    if (partial.trustBadges) next.trustBadges = partial.trustBadges;
    if (partial.newsletter) next.newsletter = partial.newsletter;
    if (partial.highlights) next.highlights = partial.highlights;
    if (partial.socialSection) next.socialSection = partial.socialSection;
    if (partial.social) next.social = { links: partial.social.links.map((link) => ({ ...link })) };
    if (partial.theme) next.theme = partial.theme;
    if (partial.slug !== undefined) next.slug = partial.slug;
    if (partial.cta) next.cta = partial.cta;
    if (partial.published !== undefined) next.published = partial.published;
    if (partial.about) next.about = partial.about;
    if (partial.contact) next.contact = partial.contact;
    return next;
  }
}
