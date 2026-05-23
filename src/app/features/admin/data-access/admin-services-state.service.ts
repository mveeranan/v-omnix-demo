import { Injectable, inject, signal, computed } from '@angular/core';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { TenantServicesApiService } from './tenant-services-api.service';
import {
  CreateServiceRequest,
  ServiceDto,
  ServiceFormMode,
  ServiceFormValue,
  UpdateServiceRequest,
  createEmptyServiceFormValue,
  serviceToFormValue
} from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class AdminServicesStateService {
  private readonly api = inject(TenantServicesApiService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly services = signal<ServiceDto[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);

  /** `null` = list only; otherwise create or edit a service */
  readonly formMode = signal<ServiceFormMode | null>(null);
  readonly editingServiceId = signal<string | null>(null);
  readonly formValue = signal<ServiceFormValue>(createEmptyServiceFormValue());

  readonly isFormOpen = computed(() => this.formMode() !== null);
  readonly editingService = computed(() => {
    const id = this.editingServiceId();
    if (!id) {
      return null;
    }
    return this.services().find((s) => s.id === id) ?? null;
  });

  readonly activeCount = computed(() => this.services().filter((s) => s.isActive).length);

  /** Services shown in the list — hides the row currently open in the edit form. */
  readonly listServices = computed(() => {
    const editingId = this.formMode() === 'edit' ? this.editingServiceId() : null;
    if (!editingId) {
      return this.services();
    }
    return this.services().filter((s) => s.id !== editingId);
  });

  load(): void {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      this.loading.set(false);
      this.loadError.set('No tenant selected. Please log in and select a workspace.');
      this.services.set([]);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);

    this.api
      .listByTenant(tenantId)
      .pipe(
        tap((items) => {
          this.services.set(items);
          this.authService.setTenantId(tenantId);
        }),
        catchError((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Could not load services.';
          this.loadError.set(message);
          this.services.set([]);
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  startCreate(): void {
    this.formMode.set('create');
    this.editingServiceId.set(null);
    this.formValue.set(createEmptyServiceFormValue());
  }

  startEdit(service: ServiceDto): void {
    this.formMode.set('edit');
    this.editingServiceId.set(service.id);
    this.formValue.set(serviceToFormValue(service));
  }

  cancelForm(): void {
    this.formMode.set(null);
    this.editingServiceId.set(null);
    this.formValue.set(createEmptyServiceFormValue());
  }

  patchFormValue(patch: Partial<ServiceFormValue>): void {
    this.formValue.update((current) => ({ ...current, ...patch }));
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
      this.notifications.warning('Service name is required.');
      return;
    }

    const durationMinutes = form.durationMinutes;
    if (durationMinutes == null || durationMinutes < 1) {
      this.notifications.warning('Duration must be at least 1 minute.');
      return;
    }

    const price = form.price ?? 0;
    if (price < 0) {
      this.notifications.warning('Price cannot be negative.');
      return;
    }

    const base = {
      tenantId,
      name,
      description: form.description.trim() || null,
      durationMinutes,
      price,
      category: form.category.trim() || null,
      isActive: form.isActive
    };

    const mode = this.formMode();
    this.saving.set(true);

    const request$ =
      mode === 'edit' && this.editingServiceId()
        ? this.api.update({ ...base, id: this.editingServiceId()! } satisfies UpdateServiceRequest)
        : this.api.create(base satisfies CreateServiceRequest);

    request$
      .pipe(
        tap((saved) => {
          this.upsertLocal(saved);
          this.notifications.success(
            mode === 'edit' ? 'Service updated successfully.' : 'Service created successfully.'
          );
          this.cancelForm();
        }),
        catchError((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Unable to save service. Please try again.';
          this.notifications.error(message);
          return EMPTY;
        }),
        finalize(() => this.saving.set(false))
      )
      .subscribe();
  }

  private upsertLocal(saved: ServiceDto): void {
    this.services.update((list) => {
      const index = list.findIndex((s) => s.id === saved.id);
      if (index === -1) {
        return [...list, saved].sort((a, b) => a.name.localeCompare(b.name));
      }
      const next = [...list];
      next[index] = saved;
      return next;
    });
  }

  private resolveTenantId(): string | null {
    return this.authService.resolveTenantId();
  }
}
