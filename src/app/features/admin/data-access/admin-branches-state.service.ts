import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { BranchService } from './branch.service';
import { ServiceAssignmentApiService } from './service-assignment-api.service';
import { TenantServicesApiService } from './tenant-services-api.service';
import {
  BranchDto,
  BranchFormMode,
  BranchFormValue,
  BranchUpsertRequest,
  branchToFormValue,
  createEmptyBranchFormValue,
  getBranchAssignedServiceIds,
  inputValueToTimeSpan
} from '../models/branch.model';
import { ServiceDto } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class AdminBranchesStateService {
  private readonly branchApi = inject(BranchService);
  private readonly servicesApi = inject(TenantServicesApiService);
  private readonly assignmentApi = inject(ServiceAssignmentApiService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly branches = signal<BranchDto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly formMode = signal<BranchFormMode | null>(null);
  readonly editingBranchId = signal<string | null>(null);
  readonly formValue = signal<BranchFormValue>(createEmptyBranchFormValue());

  readonly managingServicesBranchId = signal<string | null>(null);
  readonly tenantServices = signal<ServiceDto[]>([]);
  readonly selectedServiceIds = signal<string[]>([]);
  readonly servicesLoading = signal(false);
  readonly assigningServices = signal(false);
  readonly servicesLoadError = signal<string | null>(null);

  readonly isFormOpen = computed(() => this.formMode() !== null);
  readonly activeCount = computed(() => this.branches().filter((b) => b.isActive).length);
  readonly primaryCount = computed(() => this.branches().filter((b) => b.isPrimaryBranch).length);

  readonly editingBranch = computed(() => {
    const id = this.editingBranchId();
    if (!id) {
      return null;
    }
    return this.branches().find((b) => b.id === id) ?? null;
  });

  readonly manageServicesOpen = computed(() => this.managingServicesBranchId() !== null);

  readonly managingBranch = computed(() => {
    const id = this.managingServicesBranchId();
    if (!id) {
      return null;
    }
    return this.branches().find((b) => b.id === id) ?? null;
  });

  readonly selectedServiceIdSet = computed(() => new Set(this.selectedServiceIds()));

  readonly listBranches = computed(() => {
    const editingId = this.formMode() === 'edit' ? this.editingBranchId() : null;
    const managingId = this.managingServicesBranchId();
    return this.branches().filter((b) => {
      if (editingId && b.id === editingId) {
        return false;
      }
      if (managingId && b.id === managingId) {
        return false;
      }
      return true;
    });
  });

  load(): void {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.loading.set(false);
      this.loadError.set('No tenant selected. Please log in and select a workspace.');
      this.branches.set([]);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    this.branchApi
      .listByTenant(tenantId)
      .pipe(
        tap((items) => {
          this.branches.set(this.sortBranches(items));
          this.authService.setTenantId(tenantId);
        }),
        catchError((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Could not load branches.';
          this.loadError.set(message);
          this.branches.set([]);
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  startCreate(): void {
    this.closeManageServices();
    this.formMode.set('create');
    this.editingBranchId.set(null);
    this.formValue.set(createEmptyBranchFormValue());
  }

  startEdit(branch: BranchDto): void {
    if (!branch.id) {
      this.notifications.warning('This branch cannot be edited.');
      return;
    }
    this.closeManageServices();
    this.formMode.set('edit');
    this.editingBranchId.set(branch.id);
    this.formValue.set(branchToFormValue(branch));
  }

  cancelForm(): void {
    this.formMode.set(null);
    this.editingBranchId.set(null);
    this.formValue.set(createEmptyBranchFormValue());
  }

  patchFormValue(patch: Partial<BranchFormValue>): void {
    this.formValue.update((current) => ({ ...current, ...patch }));
  }

  openManageServices(branch: BranchDto): void {
    if (!branch.id) {
      this.notifications.warning('This branch cannot be managed.');
      return;
    }

    this.cancelForm();
    this.managingServicesBranchId.set(branch.id);
    this.selectedServiceIds.set(getBranchAssignedServiceIds(branch));
    this.servicesLoadError.set(null);
    this.loadTenantServicesForPicker();
  }

  isManagingBranch(branchId: string | undefined): boolean {
    if (!branchId) {
      return false;
    }
    return this.managingServicesBranchId() === branchId;
  }

  closeManageServices(): void {
    this.managingServicesBranchId.set(null);
    this.tenantServices.set([]);
    this.selectedServiceIds.set([]);
    this.servicesLoading.set(false);
    this.assigningServices.set(false);
    this.servicesLoadError.set(null);
  }

  loadTenantServicesForPicker(): void {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.servicesLoadError.set('No tenant selected.');
      return;
    }

    this.servicesLoading.set(true);
    this.servicesLoadError.set(null);

    this.servicesApi
      .listByTenant(tenantId)
      .pipe(
        tap((items) => {
          this.tenantServices.set(
            [...items].sort((a, b) => a.name.localeCompare(b.name))
          );
        }),
        catchError((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Could not load services.';
          this.servicesLoadError.set(message);
          this.tenantServices.set([]);
          return EMPTY;
        }),
        finalize(() => this.servicesLoading.set(false))
      )
      .subscribe();
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServiceIdSet().has(serviceId);
  }

  toggleServiceSelection(serviceId: string): void {
    this.selectedServiceIds.update((ids) => {
      if (ids.includes(serviceId)) {
        return ids.filter((id) => id !== serviceId);
      }
      return [...ids, serviceId];
    });
  }

  selectAllServices(): void {
    this.selectedServiceIds.set(this.tenantServices().map((s) => s.id));
  }

  clearAllServices(): void {
    this.selectedServiceIds.set([]);
  }

  saveServiceAssignments(): void {
    const tenantId = this.resolveTenantId();
    const branchId = this.managingServicesBranchId();

    if (!tenantId || !branchId) {
      this.notifications.warning('No branch selected.');
      return;
    }

    this.assigningServices.set(true);

    this.assignmentApi
      .assign({
        tenantId,
        branchId,
        serviceIds: this.selectedServiceIds()
      })
      .pipe(
        switchMap(() => this.branchApi.listByTenant(tenantId)),
        tap((items) => {
          this.branches.set(this.sortBranches(items));
          this.notifications.success('Branch services updated successfully.');
          this.closeManageServices();
        }),
        catchError((error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to save service assignments. Please try again.';
          this.notifications.error(message);
          return EMPTY;
        }),
        finalize(() => this.assigningServices.set(false))
      )
      .subscribe();
  }

  saveForm(): void {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.notifications.warning('No tenant selected.');
      return;
    }

    const form = this.formValue();
    const name = form.name.trim();
    if (!name) {
      this.notifications.warning('Branch name is required.');
      return;
    }

    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.notifications.warning('Enter a valid email address.');
      return;
    }

    const payload: BranchUpsertRequest = {
      tenantId,
      name,
      addressLine1: form.addressLine1.trim() || null,
      addressLine2: form.addressLine2.trim() || null,
      city: form.city.trim() || null,
      countryCode: form.countryCode.trim() || null,
      postalCode: form.postalCode.trim() || null,
      latitude: form.latitude ?? null,
      longitude: form.longitude ?? null,
      phoneNumber: form.phoneNumber.trim() || null,
      email: email || null,
      openingTime: inputValueToTimeSpan(form.openingTime),
      closingTime: inputValueToTimeSpan(form.closingTime),
      timeZone: form.timeZone.trim() || null,
      isActive: form.isActive,
      isPrimaryBranch: form.isPrimaryBranch
    };

    const mode = this.formMode();
    if (mode === 'edit' && this.editingBranchId()) {
      payload.id = this.editingBranchId()!;
    }

    this.saving.set(true);

    this.branchApi
      .upsert(payload)
      .pipe(
        tap((saved) => {
          this.upsertLocal(saved);
          this.notifications.success(
            mode === 'edit' ? 'Branch updated successfully.' : 'Branch created successfully.'
          );
          this.cancelForm();
        }),
        catchError((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Unable to save branch. Please try again.';
          this.notifications.error(message);
          return EMPTY;
        }),
        finalize(() => this.saving.set(false))
      )
      .subscribe();
  }

  private upsertLocal(saved: BranchDto): void {
    this.branches.update((list) => {
      const existing = list.find((b) => b.id === saved.id);
      const merged: BranchDto = {
        ...saved,
        services: saved.services?.length ? saved.services : existing?.services,
        serviceIds: saved.serviceIds?.length
          ? saved.serviceIds
          : existing?.serviceIds ?? getBranchAssignedServiceIds(existing ?? saved)
      };

      const index = list.findIndex((b) => b.id === saved.id);
      const next = index === -1 ? [...list, merged] : list.map((b, i) => (i === index ? merged : b));
      if (saved.isPrimaryBranch) {
        return this.sortBranches(
          next.map((b) =>
            b.id !== saved.id && b.isPrimaryBranch ? { ...b, isPrimaryBranch: false } : b
          )
        );
      }
      return this.sortBranches(next);
    });
  }

  private sortBranches(items: BranchDto[]): BranchDto[] {
    return [...items].sort((a, b) => {
      if (a.isPrimaryBranch !== b.isPrimaryBranch) {
        return a.isPrimaryBranch ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private resolveTenantId(): string | null {
    return this.authService.resolveTenantId();
  }
}
