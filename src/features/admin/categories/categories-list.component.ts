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
import { LucideAngularModule, FolderTree, ImagePlus } from 'lucide-angular';

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

      @if (formOpen()) {
        <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit category' : 'New category' }}</h3>

          <!-- Category image -->
          <div class="space-y-2">
            <span class="text-sm font-medium">Category image</span>
            <div class="flex items-center gap-4">
              @if (previewUrl()) {
                <img [src]="previewUrl()" alt="Category image" class="h-16 w-16 rounded-lg object-cover border border-[var(--border)]" />
              } @else if (currentImageUrl()) {
                <img [src]="currentImageUrl()" alt="Current image" class="h-16 w-16 rounded-lg object-cover border border-[var(--border)]" />
              } @else {
                <div class="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]">
                  <lucide-icon [img]="imageIcon" class="h-6 w-6 text-[var(--text-muted)]" />
                </div>
              }
              <label class="admin-action-secondary cursor-pointer rounded-lg px-3 py-1.5 text-sm">
                Choose image
                <input type="file" class="hidden" accept="image/*" (change)="onImageSelect($event)" />
              </label>
              @if (previewUrl() || currentImageUrl()) {
                <button type="button" class="text-sm text-rose-600 hover:underline" (click)="clearImage()">Remove</button>
              }
            </div>
          </div>

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
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      }

      @if (!formOpen()) {
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
                  <th>Image</th>
                  <th>Category name</th>
                  <th>Description</th>
                  <th class="admin-data-table__col-status">Status</th>
                  <th class="admin-data-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (cat of categories(); track cat.id; let i = $index) {
                  <tr class="admin-data-table__row">
                    <td class="admin-data-table__index">{{ i + 1 }}</td>
                    <td>
                      @if (cat.imageDocumentUrl) {
                        <img [src]="cat.imageDocumentUrl" alt="" class="h-10 w-10 rounded-lg object-cover" />
                      } @else {
                        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                          <lucide-icon [img]="categoryIcon" [size]="14" class="text-[var(--text-muted)]" />
                        </div>
                      }
                    </td>
                    <td>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ cat.name }}</div>
                      </div>
                    </td>
                    <td class="admin-data-table__col-description">
                      <p class="line-clamp-2 text-sm text-[var(--text-secondary)]">{{ cat.description || '—' }}</p>
                    </td>
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
      }
    </app-admin-page-shell>

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
  readonly imageIcon = ImagePlus;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly categories = signal<ProductCategoryDto[]>([]);
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<ProductCategoryDto | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly currentImageUrl = signal<string | null>(null);
  private pendingImageFile: File | null = null;

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
    this.form.reset({ name: '', description: '', isActive: true });
    this.clearImageState();
    this.formOpen.set(true);
  }

  openEdit(cat: ProductCategoryDto): void {
    this.editingId.set(cat.id);
    this.form.patchValue({ name: cat.name, description: cat.description ?? '', isActive: cat.isActive });
    this.clearImageState();
    this.currentImageUrl.set(cat.imageDocumentUrl ?? null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.clearImageState();
    this.formOpen.set(false);
  }

  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pendingImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.pendingImageFile = null;
    this.previewUrl.set(null);
    this.currentImageUrl.set(null);
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);

    const v = this.form.getRawValue();
    const payload: Parameters<typeof this.api.create>[0] = {
      tenantId: requireTenantId(this.auth),
      name: v.name.trim(),
      description: v.description || null,
      parentCategoryId: null,
      displayOrder: 0,
      isActive: v.isActive,
      attachments: []
    };

    if (this.pendingImageFile) {
      const base64 = await this.fileToBase64(this.pendingImageFile);
      payload.attachments = [{
        fileCategory: 16, // CategoryImage enum value
        files: [{ base64Content: base64, fileName: this.pendingImageFile.name, contentType: this.pendingImageFile.type }]
      }];
    }

    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.notifications.success('Category saved');
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.errorFromApi(err, 'Could not save category');
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
      error: (err) => {
        this.notifications.errorFromApi(err, 'Cannot delete — products use this category');
        this.deleteTarget.set(null);
      }
    });
  }

  private clearImageState(): void {
    this.pendingImageFile = null;
    this.previewUrl.set(null);
    this.currentImageUrl.set(null);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix: "data:image/jpeg;base64,..."
        resolve(result.split(',')[1] ?? result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
