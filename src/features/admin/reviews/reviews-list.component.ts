import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { ReviewAdminService } from '../data-access/review-admin.service';
import { Review } from '../models/review.model';
import { NotificationService } from '@core/notifications/notification.service';
import { LucideAngularModule, Star } from 'lucide-angular';

@Component({
  selector: 'app-reviews-list',
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
    <app-admin-page-shell eyebrow="Business" title="Reviews" description="Customer testimonials and product reviews.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add review</button>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading reviews…" />
      } @else if (!reviews().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No reviews yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add review</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Author</th>
                <th>Product</th>
                <th>Rating</th>
                <th class="admin-data-table__col-status">Status</th>
                <th>Date</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of reviews(); track r.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="reviewIcon" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ r.author }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-[var(--text-secondary)]">{{ r.productName || '—' }}</td>
                  <td>{{ r.rating }} / 5</td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge
                      [label]="r.isPublished ? 'Published' : 'Draft'"
                      [variant]="r.isPublished ? 'active' : 'draft'"
                    />
                  </td>
                  <td>{{ formatDate(r.createdAt) }}</td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(r)" />
                      <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(r)" />
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
        <form class="admin-glass-card relative w-full max-w-lg space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit review' : 'New review' }}</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Author</span>
              <input class="pf-editor-input w-full" formControlName="author" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Product name</span>
              <input class="pf-editor-input w-full" formControlName="productName" />
            </label>
          </div>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Title</span>
            <input class="pf-editor-input w-full" formControlName="title" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Review</span>
            <textarea class="pf-editor-input w-full" formControlName="body" rows="3"></textarea>
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Rating (1–5)</span>
            <input class="pf-editor-input w-full" type="number" min="1" max="5" formControlName="rating" />
          </label>
          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" formControlName="isPublished" /> Published</label>
            <label class="flex items-center gap-2"><input type="checkbox" formControlName="isVerifiedPurchase" /> Verified purchase</label>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeModal()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      </div>
    }

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete review"
      [message]="'Delete review by ' + (deleteTarget()?.author ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class ReviewsListComponent implements OnInit {
  private readonly api = inject(ReviewAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly reviewIcon = Star;
  readonly loading = signal(true);
  readonly reviews = signal<Review[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<Review | null>(null);

  readonly form = this.fb.nonNullable.group({
    author: ['', Validators.required],
    productName: [''],
    title: [''],
    body: ['', Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    isPublished: [true],
    isVerifiedPurchase: [false]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.reviews.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      author: '',
      productName: '',
      title: '',
      body: '',
      rating: 5,
      isPublished: true,
      isVerifiedPurchase: false
    });
    this.modalOpen.set(true);
  }

  openEdit(r: Review): void {
    this.editingId.set(r.id);
    this.form.patchValue({
      author: r.author,
      productName: r.productName ?? '',
      title: r.title ?? '',
      body: r.body,
      rating: r.rating,
      isPublished: r.isPublished,
      isVerifiedPurchase: r.isVerifiedPurchase
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
      tenantId: 'default',
      author: v.author.trim(),
      productName: v.productName.trim(),
      title: v.title.trim(),
      body: v.body.trim(),
      rating: v.rating,
      isPublished: v.isPublished,
      isVerifiedPurchase: v.isVerifiedPurchase
    };
    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.notifications.success('Review saved');
      }
    });
  }

  confirmDelete(r: Review): void {
    this.deleteTarget.set(r);
  }

  doDelete(): void {
    const r = this.deleteTarget();
    if (!r) return;
    this.api.delete(r.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Review deleted');
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
