import { computed, effect, Injectable, inject, signal, untracked } from '@angular/core';
import { EMPTY, Observable, map, switchMap, tap } from 'rxjs';
import { PortfolioTenantStateService } from '../../portfolio/data-access/portfolio-tenant-state.service';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { AdminDashboardDataService } from '../services/admin-dashboard-data.service';
import { BusinessProfileService } from './business-profile.service';
import {
  BusinessProfileDto,
  BusinessProfileUpsertRequest,
  BusinessProfileUpdateRequest,
  createEmptyBusinessProfile,
  getLogoPreviewUrl,
  hasBusinessProfileData
} from '../models/business-profile.model';

const PROFILE_LOAD_WARNING = 'Could not load business profile.';

@Injectable({ providedIn: 'root' })
export class AdminProfileStateService {
  private readonly businessProfileService = inject(BusinessProfileService);
  private readonly tenantState = inject(PortfolioTenantStateService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly dashboardData = inject(AdminDashboardDataService);

  readonly profile = signal<BusinessProfileDto>(createEmptyBusinessProfile());
  readonly profileSaving = signal(false);
  readonly profileLastSavedAt = signal<Date | null>(null);

  readonly profileLoading = computed(() => this.tenantState.loading());
  readonly formsReady = computed(() => {
    if (!this.authService.resolveTenantId()) {
      return true;
    }
    return this.tenantState.loaded() && !this.tenantState.loading();
  });
  readonly loadError = computed(() => {
    if (!this.authService.resolveTenantId()) {
      return 'No tenant selected. Please log in and select a workspace.';
    }
    if (this.tenantState.loadError()) {
      return PROFILE_LOAD_WARNING;
    }
    if (
      this.tenantState.loaded() &&
      !hasBusinessProfileData(this.tenantState.businessProfile())
    ) {
      return PROFILE_LOAD_WARNING;
    }
    return null;
  });

  readonly profileComplete = computed(() => {
    const p = this.profile();
    return Boolean(p?.businessName?.trim() && p?.businessTypeId);
  });

  constructor() {
    effect(() => {
      if (!this.tenantState.loaded()) {
        return;
      }

      const tenantId = this.authService.resolveTenantId() ?? '';
      const loaded = this.tenantState.businessProfile();
      if (loaded && hasBusinessProfileData(loaded)) {
        const next = { ...loaded, tenantId: loaded.tenantId ?? tenantId };
        const current = untracked(() => this.profile());
        if (
          current.tenantId !== next.tenantId ||
          current.businessName !== next.businessName ||
          current.businessTypeId !== next.businessTypeId
        ) {
          this.profile.set(next);
        }
        this.syncDashboardFromProfile(next);
        return;
      }

      const current = untracked(() => this.profile());
      if (current.tenantId !== tenantId || hasBusinessProfileData(current)) {
        this.profile.set(createEmptyBusinessProfile(tenantId));
      }
    });
  }

  load(): void {
    this.tenantState.ensureLoaded();
  }

  saveProfile(payload: BusinessProfileUpdateRequest): Observable<BusinessProfileDto> {
    if (this.profileSaving()) {
      return EMPTY;
    }

    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.notifications.error('No tenant selected. Please log in again.');
      return EMPTY;
    }

    const body: BusinessProfileUpsertRequest = { ...payload, tenantId };
    this.profileSaving.set(true);
    return this.businessProfileService.upsert(body).pipe(
      switchMap((updated) =>
        this.tenantState.refresh().pipe(
          map((result) => {
            const refreshed = result.businessProfile ?? updated;
            return { ...refreshed, tenantId: refreshed.tenantId ?? tenantId };
          })
        )
      ),
      tap({
        next: (saved) => {
          this.profile.set({ ...saved, tenantId: saved.tenantId ?? tenantId });
          this.authService.setTenantId(saved.tenantId ?? tenantId);
          this.profileSaving.set(false);
          this.profileLastSavedAt.set(new Date());
          this.syncDashboardFromProfile(saved);
          this.notifications.success('Business profile saved');
        },
        error: (err) => {
          this.profileSaving.set(false);
          this.notifications.errorFromApi(err, 'Could not save business profile');
        }
      })
    );
  }

  private resolveTenantId(): string | null {
    return this.authService.resolveTenantId(
      this.tenantState.businessProfile()?.tenantId ?? this.profile().tenantId ?? undefined
    );
  }

  private syncDashboardFromProfile(profile: BusinessProfileDto): void {
    if (!profile.businessName?.trim()) {
      return;
    }

    const initials = profile.businessName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    const logoUrl = getLogoPreviewUrl(profile) || undefined;
    const tagline =
      profile.description?.slice(0, 80) ?? this.dashboardData.dashboardData().tenant.tagline;
    const current = this.dashboardData.dashboardData().tenant;

    if (
      current.businessName === profile.businessName &&
      current.logoInitials === (initials || 'WB') &&
      current.logoUrl === logoUrl &&
      current.tagline === tagline
    ) {
      return;
    }

    this.dashboardData.updateTenantBranding({
      businessName: profile.businessName,
      logoInitials: initials || 'WB',
      logoUrl,
      tagline
    });
  }
}
