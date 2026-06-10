import { Injectable, inject, signal, computed } from '@angular/core';
import { EMPTY, Observable, tap, catchError, of } from 'rxjs';
import { BusinessProfileService } from './business-profile.service';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AdminDashboardDataService } from '../services/admin-dashboard-data.service';
import {
  BusinessProfileDto,
  BusinessProfileUpsertRequest,
  BusinessProfileUpdateRequest,
  createEmptyBusinessProfile,
  hasBusinessProfileData
} from '../models/business-profile.model';

const PROFILE_LOAD_WARNING = 'Could not load business profile.';

@Injectable({ providedIn: 'root' })
export class AdminProfileStateService {
  private readonly businessProfileService = inject(BusinessProfileService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly dashboardData = inject(AdminDashboardDataService);

  readonly profile = signal<BusinessProfileDto | null>(null);
  readonly profileLoading = signal(true);
  readonly profileSaving = signal(false);
  readonly profileLastSavedAt = signal<Date | null>(null);
  readonly loadError = signal<string | null>(null);

  readonly formsReady = computed(() => !this.profileLoading());

  readonly profileComplete = computed(() => {
    const p = this.profile();
    return Boolean(p?.businessName?.trim() && p?.businessTypeId);
  });

  load(): void {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.profileLoading.set(false);
      this.loadError.set('No tenant selected. Please log in and select a workspace.');
      this.profile.set(createEmptyBusinessProfile());
      return;
    }

    this.profileLoading.set(true);
    this.loadError.set(null);

    this.businessProfileService.getByTenant(tenantId).pipe(catchError(() => of(null))).subscribe({
      next: (profile) => {
        if (!hasBusinessProfileData(profile)) {
          this.loadError.set(PROFILE_LOAD_WARNING);
          this.profile.set(createEmptyBusinessProfile(tenantId));
        } else {
          this.loadError.set(null);
          this.profile.set({ ...profile!, tenantId: profile!.tenantId ?? tenantId });
        }

        this.profileLoading.set(false);

        if (tenantId) {
          this.authService.setTenantId(tenantId);
        }
        if (hasBusinessProfileData(this.profile())) {
          this.syncDashboardFromProfile(this.profile()!);
        }
      },
      error: () => {
        this.profileLoading.set(false);
        this.loadError.set(PROFILE_LOAD_WARNING);
        this.profile.set(createEmptyBusinessProfile(tenantId));
      }
    });
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
      tap({
        next: (updated) => {
          const savedTenantId = updated.tenantId ?? tenantId;
          this.authService.setTenantId(savedTenantId);
          this.profile.set({ ...updated, tenantId: savedTenantId });
          this.profileSaving.set(false);
          this.profileLastSavedAt.set(new Date());
          this.loadError.set(null);
          this.syncDashboardFromProfile(updated);
          this.notifications.success('Business profile saved');
        },
        error: () => {
          this.profileSaving.set(false);
          this.notifications.error('Could not save business profile');
        }
      })
    );
  }

  private resolveTenantId(): string | null {
    return this.authService.resolveTenantId(this.profile()?.tenantId ?? undefined);
  }

  private syncDashboardFromProfile(profile: BusinessProfileDto): void {
    if (profile.businessName?.trim()) {
      const initials = profile.businessName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
      this.dashboardData.updateTenantBranding({
        businessName: profile.businessName,
        logoInitials: initials || 'WB',
        tagline: profile.description?.slice(0, 80) ?? this.dashboardData.dashboardData().tenant.tagline
      });
    }
  }
}
