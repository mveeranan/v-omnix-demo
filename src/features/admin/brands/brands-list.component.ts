import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { BrandAdminService } from '../data-access/brand-admin.service';
import { BrandDto } from '@features/catalog/models/brand.model';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { LucideAngularModule, Award } from 'lucide-angular';

@Component({
  selector: 'app-brands-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    LucideAngularModule
  ],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Brands" description="Optional product brands for your catalog.">
      <button admin-page-actions type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add brand</button>

      @if (loading()) {
        <app-loading-spinner label="Loading brands…" />
      } @else if (!brands().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No brands yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create brand</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Brand name</th>
                <th class="admin-data-table__col-status">Status</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (b of brands(); track b.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="brandIcon" [size]="16" [strokeWidth]="2" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ b.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge
                      [label]="b.isActive ? 'Active' : 'Inactive'"
                      [variant]="b.isActive ? 'active' : 'inactive'"
                    />
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(b)" />
                      <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(b)" />
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
      }
    </app-admin-page-shell>

    @if (modalOpen()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4">
        <div class="admin-modal-backdrop absolute inset-0" (click)="closeModal()"></div>
        <form class="admin-glass-card relative w-full max-w-md space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit brand' : 'New brand' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Name</span>
            <input class="pf-editor-input w-full" formControlName="name" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Description</span>
            <textarea class="pf-editor-input w-full" formControlName="description" rows="2"></textarea>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isActive" /> Active
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeModal()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
          </div>
        </form>
      </div>
    }

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete brand"
      [message]="'Delete ' + (deleteTarget()?.name ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class BrandsListComponent implements OnInit {
  private readonly api = inject(BrandAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly brandIcon = Award;
  readonly loading = signal(true);
  readonly brands = signal<BrandDto[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<BrandDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.brands.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', isActive: true });
    this.modalOpen.set(true);
  }

  openEdit(b: BrandDto): void {
    this.editingId.set(b.id);
    this.form.patchValue({
      name: b.name,
      description: b.description ?? '',
      isActive: b.isActive
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      tenantId: requireTenantId(this.auth),
      name: v.name.trim(),
      description: v.description || null,
      isActive: v.isActive
    };
    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.notifications.success('Brand saved');
      }
    });
  }

  confirmDelete(b: BrandDto): void {
    this.deleteTarget.set(b);
  }

  doDelete(): void {
    const b = this.deleteTarget();
    if (!b) return;
    this.api.delete(b.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
      }
    });
  }
}
