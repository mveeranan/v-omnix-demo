import { Injectable, inject, signal, computed } from '@angular/core';
import { forkJoin, of, EMPTY, catchError, Observable, tap } from 'rxjs';
import { BusinessProfileService } from './business-profile.service';
import { BranchService } from './branch.service';
import { TenantContextService } from './tenant-context.service';
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
import {
  BranchDto,
  BranchUpsertRequest,
  createEmptyBranch,
  pickPrimaryBranch
} from '../models/branch.model';

const PROFILE_LOAD_WARNING = 'Could not load business profile.';

@Injectable({ providedIn: 'root' })
export class AdminProfileStateService {
  private readonly businessProfileService = inject(BusinessProfileService);
  private readonly branchService = inject(BranchService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly dashboardData = inject(AdminDashboardDataService);

  readonly profile = signal<BusinessProfileDto | null>(null);
  readonly branch = signal<BranchDto | null>(null);
  readonly profileLoading = signal(true);
  readonly branchLoading = signal(true);
  readonly profileSaving = signal(false);
  readonly branchSaving = signal(false);
  readonly profileLastSavedAt = signal<Date | null>(null);
  readonly branchLastSavedAt = signal<Date | null>(null);
  readonly loadError = signal<string | null>(null);

  readonly showBranchSection = this.tenantContext.showBranchOnProfile;
  readonly formsReady = computed(
    () => !this.profileLoading() && (!this.showBranchSection() || !this.branchLoading())
  );

  readonly profileComplete = computed(() => {
    const p = this.profile();
    return Boolean(p?.businessName?.trim() && p?.businessTypeId);
  });

  readonly branchComplete = computed(() => {
    const b = this.branch();
    return Boolean(b?.name?.trim() && b?.addressLine1?.trim());
  });

  load(): void {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.profileLoading.set(false);
      this.branchLoading.set(false);
      this.loadError.set('No tenant selected. Please log in and select a workspace.');
      this.profile.set(createEmptyBusinessProfile());
      this.branch.set(createEmptyBranch());
      return;
    }

    this.profileLoading.set(true);
    this.branchLoading.set(true);
    this.loadError.set(null);

    const profile$ = this.businessProfileService.getByTenant(tenantId).pipe(
      catchError(() => of(null))
    );

    const branch$ = this.showBranchSection()
      ? this.branchService.listByTenant(tenantId).pipe(catchError(() => of([] as BranchDto[])))
      : of([] as BranchDto[]);

    forkJoin({ profile: profile$, branches: branch$ }).subscribe({
      next: ({ profile, branches }) => {
        if (!hasBusinessProfileData(profile)) {
          this.loadError.set(PROFILE_LOAD_WARNING);
          this.profile.set(createEmptyBusinessProfile(tenantId));
        } else {
          this.loadError.set(null);
          this.profile.set({ ...profile!, tenantId: profile!.tenantId ?? tenantId });
        }

        const primary = pickPrimaryBranch(branches);
        this.branch.set(primary ?? createEmptyBranch(tenantId));

        this.profileLoading.set(false);
        this.branchLoading.set(false);

        if (tenantId) {
          this.authService.setTenantId(tenantId);
        }
        if (hasBusinessProfileData(this.profile())) {
          this.syncDashboardFromProfile(this.profile()!);
        }
      },
      error: () => {
        this.profileLoading.set(false);
        this.branchLoading.set(false);
        this.loadError.set(PROFILE_LOAD_WARNING);
        this.profile.set(createEmptyBusinessProfile(tenantId));
        this.branch.set(createEmptyBranch(tenantId));
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

  saveBranch(payload: Omit<BranchUpsertRequest, 'id' | 'tenantId'>): Observable<BranchDto> {
    if (this.branchSaving()) {
      return EMPTY;
    }

    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.notifications.error('No tenant selected. Please log in again.');
      return EMPTY;
    }

    const existing = this.branch();
    const body: BranchUpsertRequest = {
      ...payload,
      tenantId,
      ...(existing?.id ? { id: existing.id } : {})
    };

    this.branchSaving.set(true);
    return this.branchService.upsert(body).pipe(
      tap({
        next: (updated) => {
          this.branch.set({ ...updated, tenantId: updated.tenantId ?? tenantId });
          this.branchSaving.set(false);
          this.branchLastSavedAt.set(new Date());
          this.notifications.success('Branch details saved');
        },
        error: () => {
          this.branchSaving.set(false);
          this.notifications.error('Could not save branch details');
        }
      })
    );
  }

  private resolveTenantId(): string | null {
    return this.authService.resolveTenantId(
      this.profile()?.tenantId ?? this.branch()?.tenantId ?? undefined
    );
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
