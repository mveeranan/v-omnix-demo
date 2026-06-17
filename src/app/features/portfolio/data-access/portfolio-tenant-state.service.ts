import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { BusinessProfileDto } from '../../admin/models/business-profile.model';
import { Portfolio } from '../models/portfolio.model';
import { UserDto } from '../../admin/models/user.model';
import { PortfolioApiService, PortfolioLoadResult } from './portfolio-api.service';

const EMPTY_RESULT: PortfolioLoadResult = {
  user: null,
  businessProfile: null,
  presetId: null,
  portfolio: null
};

@Injectable({ providedIn: 'root' })
export class PortfolioTenantStateService {
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly auth = inject(AuthService);

  private activeTenantId: string | null = null;
  private inFlight: Observable<PortfolioLoadResult> | null = null;

  readonly user = signal<UserDto | null>(null);
  readonly businessProfile = signal<BusinessProfileDto | null>(null);
  readonly presetId = signal<string | null>(null);
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
    if (this.loaded() && this.activeTenantId === tenantId) {
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
    if (this.loaded() && this.activeTenantId === tenantId) {
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

  private loadForTenant(tenantId: string): Observable<PortfolioLoadResult> {
    if (this.inFlight && this.activeTenantId === tenantId) {
      return this.inFlight;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.activeTenantId = tenantId;

    this.inFlight = this.portfolioApi.getByTenant(tenantId).pipe(
      tap((result) => this.applyResult(result, tenantId)),
      catchError(() => {
        this.loadError.set('Could not load workspace data.');
        this.applyResult(EMPTY_RESULT, tenantId);
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

  private applyResult(result: PortfolioLoadResult, tenantId: string): void {
    this.user.set(result.user);
    this.businessProfile.set(result.businessProfile);
    this.presetId.set(result.presetId);
    this.portfolio.set(result.portfolio);
    this.loaded.set(true);
    this.loadError.set(null);
    this.auth.setTenantId(tenantId);
  }

  private currentResult(): PortfolioLoadResult {
    return {
      user: this.user(),
      businessProfile: this.businessProfile(),
      presetId: this.presetId(),
      portfolio: this.portfolio()
    };
  }

  private reset(): void {
    this.user.set(null);
    this.businessProfile.set(null);
    this.presetId.set(null);
    this.portfolio.set(null);
    this.loaded.set(false);
    this.loading.set(false);
    this.loadError.set(null);
    this.activeTenantId = null;
    this.inFlight = null;
  }
}
