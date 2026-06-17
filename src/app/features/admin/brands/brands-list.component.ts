import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { BrandAdminService } from '../data-access/brand-admin.service';
import { BrandDto } from '../models/brand.model';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-brands-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Brands" description="Optional product brands for your catalog.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add brand</button>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading brands…" />
      } @else if (!brands().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No brands yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create brand</button>
        </div>
      } @else {
        <div class="admin-glass-card overflow-hidden rounded-xl">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-[var(--border)]">
              <tr>
                <th class="p-3">Name</th>
                <th class="p-3">Slug</th>
                <th class="p-3">Active</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (b of brands(); track b.id) {
                <tr class="border-t border-[var(--border)]">
                  <td class="p-3 font-medium">{{ b.name }}</td>
                  <td class="p-3 text-[var(--text-muted)]">{{ b.slug }}</td>
                  <td class="p-3">{{ b.isActive ? 'Yes' : 'No' }}</td>
                  <td class="p-3">
                    <button type="button" class="mr-3 text-indigo-600 hover:underline" (click)="openEdit(b)">Edit</button>
                    <button type="button" class="text-rose-600 hover:underline" (click)="confirmDelete(b)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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
            <span class="text-sm font-medium">Slug</span>
            <input class="pf-editor-input w-full" formControlName="slug" />
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

  readonly loading = signal(true);
  readonly brands = signal<BrandDto[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<BrandDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: [''],
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
    this.form.reset({ name: '', slug: '', description: '', isActive: true });
    this.modalOpen.set(true);
  }

  openEdit(b: BrandDto): void {
    this.editingId.set(b.id);
    this.form.patchValue(b);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      tenantId: 'default',
      name: v.name.trim(),
      slug: v.slug.trim() || v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: v.description,
      logoDocumentId: null,
      logoUrl: '',
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
