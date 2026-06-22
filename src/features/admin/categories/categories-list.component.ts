import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { CategoryAdminService } from '../data-access/category-admin.service';
import { ProductCategoryDto } from '@features/catalog/models/product-category.model';
import { NotificationService } from '@core/notifications/notification.service';
import { OnboardingService } from '../services/onboarding.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { LucideAngularModule, FolderTree } from 'lucide-angular';

@Component({
  selector: 'app-categories-list',
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
    <app-admin-page-shell eyebrow="Catalog" title="Categories" description="Organize products — create at least one category before adding products.">
      <button admin-page-actions type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add category</button>

      @if (loading()) {
        <app-loading-spinner label="Loading categories…" />
      } @else if (!categories().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No categories yet</p>
          <p class="mt-1 text-sm text-[var(--text-secondary)]">Create your first category to organize products.</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create category</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Category name</th>
                <th>Order</th>
                <th class="admin-data-table__col-status">Status</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="categoryIcon" [size]="16" [strokeWidth]="2" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ cat.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ cat.displayOrder }}</td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge
                      [label]="cat.isActive ? 'Active' : 'Inactive'"
                      [variant]="cat.isActive ? 'active' : 'inactive'"
                    />
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(cat)" />
                      <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(cat)" />
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
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit category' : 'New category' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Name</span>
            <input class="pf-editor-input w-full" formControlName="name" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Description</span>
            <textarea class="pf-editor-input w-full" formControlName="description" rows="2"></textarea>
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Display order</span>
            <input class="pf-editor-input w-full" type="number" formControlName="displayOrder" />
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isActive" /> Active
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeModal()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </div>
    }

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete category"
      [message]="'Delete ' + (deleteTarget()?.name ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class CategoriesListComponent implements OnInit {
  private readonly api = inject(CategoryAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly onboarding = inject(OnboardingService);
  private readonly auth = inject(AuthService);

  readonly categoryIcon = FolderTree;
  readonly loading = signal(true);
  readonly categories = signal<ProductCategoryDto[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<ProductCategoryDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    displayOrder: [0],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.listFlat().subscribe({
      next: (items) => {
        this.categories.set(items);
        this.loading.set(false);
        this.onboarding.refresh();
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', displayOrder: this.categories().length, isActive: true });
    this.modalOpen.set(true);
  }

  openEdit(cat: ProductCategoryDto): void {
    this.editingId.set(cat.id);
    this.form.patchValue({
      name: cat.name,
      description: cat.description ?? '',
      displayOrder: cat.displayOrder,
      isActive: cat.isActive
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
      parentCategoryId: null,
      displayOrder: v.displayOrder,
      isActive: v.isActive
    };
    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.notifications.success('Category saved');
      },
      error: (err) => {
        this.notifications.error(err?.message === 'HAS_PRODUCTS' ? 'Cannot delete category with products' : 'Could not save category');
      }
    });
  }

  confirmDelete(cat: ProductCategoryDto): void {
    this.deleteTarget.set(cat);
  }

  doDelete(): void {
    const cat = this.deleteTarget();
    if (!cat) return;
    this.api.delete(cat.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Category deleted');
      },
      error: () => {
        this.notifications.error('Cannot delete — products use this category');
        this.deleteTarget.set(null);
      }
    });
  }
}
