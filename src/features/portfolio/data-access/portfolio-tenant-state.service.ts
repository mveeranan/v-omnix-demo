import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap, timeout } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { BusinessProfileDto } from '../../admin/models/business-profile.model';
import { Portfolio } from '../models/portfolio.model';
import { UserDto } from '../../admin/models/user.model';
import { PortfolioApiService } from './portfolio-api.service';
import { PortfolioLoadResult } from '../models/dto/portfolio-load-result.dto';
import { HeroSlideDto } from '../models/hero-slides.model';
import { SocialMediaDto } from '../models/social-media.model';
import { createDefaultWebsitePortfolio } from '../models/portfolio-defaults';
import { mergeHeroSlidesIntoPortfolio } from './hero-slides-portfolio.util';
import { mergeSocialMediaIntoPortfolio } from './social-media-portfolio.util';

const EMPTY_RESULT: PortfolioLoadResult = {
  user: null,
  businessProfile: null,
  presetId: null,
  heroSlides: [],
  socialMedia: null,
  portfolio: null
};

const PORTFOLIO_LOAD_TIMEOUT_MS = 15_000;

@Injectable({ providedIn: 'root' })
export class PortfolioTenantStateService {
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly auth = inject(AuthService);

  private activeTenantId: string | null = null;
  private inFlight: Observable<PortfolioLoadResult> | null = null;

  readonly user = signal<UserDto | null>(null);
  readonly businessProfile = signal<BusinessProfileDto | null>(null);
  readonly presetId = signal<string | null>(null);
  readonly heroSlides = signal<HeroSlideDto[]>([]);
  readonly socialMedia = signal<SocialMediaDto | null>(null);
  readonly portfolio = signal<Portfolio | null>(null);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly loadError = signal<string | null>(null);

  ensureLoaded(): void {
    const tenantId = this.auth.resolveTenantId();
    if (!tenantId) {
      this.reset();
      return;
    }
    if (this.activeTenantId && this.activeTenantId !== tenantId) {
      this.reset();
    }
    if (this.loaded() && this.activeTenantId === tenantId && !this.loadError()) {
      return;
    }
    this.loadForTenant(tenantId).subscribe({ error: () => undefined });
  }

  ensureLoaded$(): Observable<PortfolioLoadResult> {
    const tenantId = this.auth.resolveTenantId();
    if (!tenantId) {
      this.reset();
      return of(EMPTY_RESULT);
    }
    if (this.activeTenantId && this.activeTenantId !== tenantId) {
      this.reset();
    }
    if (this.loaded() && this.activeTenantId === tenantId && !this.loadError()) {
      return of(this.currentResult());
    }
    return this.loadForTenant(tenantId);
  }

  refresh(): Observable<PortfolioLoadResult> {
    const tenantId = this.auth.resolveTenantId();
    if (!tenantId) {
      this.reset();
      return of(EMPTY_RESULT);
    }
    this.inFlight = null;
    return this.loadForTenant(tenantId);
  }

  clearSession(): void {
    this.reset();
  }

  private loadForTenant(tenantId: string): Observable<PortfolioLoadResult> {
    if (this.inFlight && this.activeTenantId === tenantId) {
      return this.inFlight;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.activeTenantId = tenantId;

    this.inFlight = this.portfolioApi.getByTenant(tenantId).pipe(
      timeout(PORTFOLIO_LOAD_TIMEOUT_MS),
      tap((result) => this.applyResult(result, tenantId)),
      catchError(() => {
        this.loadError.set('Could not load workspace data.');
        this.applyResult(EMPTY_RESULT, tenantId, { preserveError: true, failed: true });
        return of(EMPTY_RESULT);
      }),
      finalize(() => {
        this.loading.set(false);
        this.inFlight = null;
      }),
      shareReplay(1)
    );

    return this.inFlight;
  }

  private applyResult(
    result: PortfolioLoadResult,
    tenantId: string,
    options?: { preserveError?: boolean; failed?: boolean }
  ): void {
    const heroSlides = result.heroSlides ?? [];
    const socialMedia = result.socialMedia ?? null;

    this.user.set(result.user);
    this.businessProfile.set(result.businessProfile);
    this.presetId.set(result.presetId);
    this.heroSlides.set(heroSlides);
    this.socialMedia.set(socialMedia);
    this.portfolio.set(this.resolvePortfolio(result.portfolio, heroSlides, socialMedia));
    this.loaded.set(!options?.failed);
    if (!options?.preserveError) {
      this.loadError.set(null);
    }
    this.auth.setTenantId(tenantId);
  }

  /** Keep hero slides + social links when website draft is not created yet. */
  private resolvePortfolio(
    portfolio: Portfolio | null,
    heroSlides: HeroSlideDto[],
    socialMedia: SocialMediaDto | null
  ): Portfolio | null {
    let resolved = portfolio;
    if (!resolved && (heroSlides.length || socialMedia?.links?.length)) {
      resolved = createDefaultWebsitePortfolio();
    }
    if (!resolved) {
      return null;
    }
    if (heroSlides.length) {
      resolved = mergeHeroSlidesIntoPortfolio(resolved, heroSlides);
    }
    if (socialMedia?.links?.length) {
      resolved = mergeSocialMediaIntoPortfolio(resolved, socialMedia);
    }
    return resolved;
  }

  private currentResult(): PortfolioLoadResult {
    return {
      user: this.user(),
      businessProfile: this.businessProfile(),
      presetId: this.presetId(),
      heroSlides: this.heroSlides(),
      socialMedia: this.socialMedia(),
      portfolio: this.portfolio()
    };
  }

  private reset(): void {
    this.user.set(null);
    this.businessProfile.set(null);
    this.presetId.set(null);
    this.heroSlides.set([]);
    this.socialMedia.set(null);
    this.portfolio.set(null);
    this.loaded.set(false);
    this.loading.set(false);
    this.loadError.set(null);
    this.activeTenantId = null;
    this.inFlight = null;
  }
}
