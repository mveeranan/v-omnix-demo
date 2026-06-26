import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ProductTagApiService } from '@features/catalog/data-access/product-tag-api.service';
import { ProductTagDto } from '@features/catalog/models/product-tag.model';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { LucideAngularModule, Tag } from 'lucide-angular';

@Component({
  selector: 'app-product-tags-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminStatusBadgeComponent,
    LoadingSpinnerComponent,
    LucideAngularModule
  ],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Product tags" description="Tags for filtering and organizing products.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add tag</button>
      </div>

      @if (formOpen()) {
        <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">New tag</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Name</span>
            <input class="pf-editor-input w-full" formControlName="name" />
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isActive" /> Active
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      }

      @if (loading()) {
        <app-loading-spinner label="Loading tags…" />
      } @else if (!tags().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No tags yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create tag</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Tag name</th>
                <th class="admin-data-table__col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tags(); track t.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="tagIcon" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ t.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge
                      [label]="t.isActive ? 'Active' : 'Inactive'"
                      [variant]="t.isActive ? 'active' : 'inactive'"
                    />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
      }
    </app-admin-page-shell>
  `
})
export class ProductTagsListComponent implements OnInit {
  private readonly api = inject(ProductTagApiService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly tagIcon = Tag;
  readonly loading = signal(true);
  readonly tags = signal<ProductTagDto[]>([]);
  readonly formOpen = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.tags.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.form.reset({ name: '', isActive: true });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.api
      .create({
        tenantId: requireTenantId(this.auth),
        name: v.name.trim(),
        isActive: v.isActive
      })
      .subscribe({
        next: () => {
          this.closeForm();
          this.load();
          this.notifications.success('Tag created');
        },
        error: (err) => this.notifications.error(err?.message ?? 'Could not create tag')
      });
  }
}
