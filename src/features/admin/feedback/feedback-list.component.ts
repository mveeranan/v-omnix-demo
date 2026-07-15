import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { LucideAngularModule, Star } from 'lucide-angular';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';

export interface StoreFeedbackDto {
  id: string;
  tenantId: string;
  authorName: string;
  authorRole: string | null;
  message: string;
  rating: number | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
}

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    AdminStatusBadgeComponent,
    LucideAngularModule
  ],
  template: `
    <app-admin-page-shell
      eyebrow="Website"
      title="Customer Feedback"
      description="Manage testimonials displayed on your public homepage."
    >
      <button admin-page-actions type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">
        + Add testimonial
      </button>

      @if (formOpen()) {
        <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit testimonial' : 'New testimonial' }}</h3>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Author name</span>
              <input class="pf-editor-input w-full" formControlName="authorName" placeholder="Jane Doe" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Author role / label <span class="text-[var(--text-muted)] text-xs">(optional)</span></span>
              <input class="pf-editor-input w-full" formControlName="authorRole" placeholder="Verified Customer" />
            </label>
          </div>

          <label class="block space-y-1">
            <span class="text-sm font-medium">Message</span>
            <textarea class="pf-editor-input w-full" formControlName="message" rows="3" placeholder="Their experience with your store…"></textarea>
          </label>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Rating <span class="text-[var(--text-muted)] text-xs">(1–5, optional)</span></span>
              <input class="pf-editor-input w-full" type="number" min="1" max="5" formControlName="rating" placeholder="5" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Display order</span>
              <input class="pf-editor-input w-full" type="number" min="0" formControlName="displayOrder" />
            </label>
          </div>

          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isPublished" /> Published (visible on website)
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
          <app-loading-spinner label="Loading feedback…" />
        } @else if (!items().length) {
          <div class="admin-glass-card rounded-xl p-8 text-center">
            <p class="font-medium">No testimonials yet</p>
            <p class="mt-1 text-sm text-[var(--text-secondary)]">Add a testimonial to display on your website homepage.</p>
            <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add testimonial</button>
          </div>
        } @else {
          <app-table>
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th class="admin-data-table__index">#</th>
                  <th>Author</th>
                  <th>Message</th>
                  <th>Rating</th>
                  <th class="admin-data-table__col-status">Status</th>
                  <th class="admin-data-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of items(); track item.id; let i = $index) {
                  <tr class="admin-data-table__row">
                    <td class="admin-data-table__index">{{ i + 1 }}</td>
                    <td>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ item.authorName }}</div>
                        @if (item.authorRole) {
                          <div class="admin-data-table__entity-subtitle">{{ item.authorRole }}</div>
                        }
                      </div>
                    </td>
                    <td>
                      <p class="line-clamp-2 text-sm text-[var(--text-secondary)] max-w-xs">{{ item.message }}</p>
                    </td>
                    <td>
                      @if (item.rating) {
                        <div class="flex items-center gap-0.5">
                          @for (s of stars(item.rating); track $index) {
                            <lucide-icon [img]="starIcon" [size]="12" class="text-amber-400" style="fill:#fbbf24" />
                          }
                        </div>
                      } @else {
                        <span class="text-[var(--text-muted)]">—</span>
                      }
                    </td>
                    <td class="admin-data-table__col-status">
                      <app-admin-status-badge
                        [label]="item.isPublished ? 'Published' : 'Draft'"
                        [variant]="item.isPublished ? 'active' : 'draft'"
                      />
                    </td>
                    <td class="admin-data-table__col-actions">
                      <div class="admin-data-table__actions">
                        <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(item)" />
                        <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(item)" />
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
      title="Delete testimonial"
      [message]="'Delete feedback from ' + (deleteTarget()?.authorName ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class FeedbackListComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly starIcon = Star;
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly items = signal<StoreFeedbackDto[]>([]);
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<StoreFeedbackDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    authorName: ['', Validators.required],
    authorRole: [''],
    message: ['', Validators.required],
    rating: this.fb.control<number | null>(null),
    displayOrder: [0],
    isPublished: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<StoreFeedbackDto[]>>(API_ENDPOINTS.storeFeedback.list()).subscribe({
      next: (r) => {
        this.items.set(r.data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ authorName: '', authorRole: '', message: '', rating: null, displayOrder: this.items().length, isPublished: true });
    this.formOpen.set(true);
  }

  openEdit(item: StoreFeedbackDto): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      authorName: item.authorName,
      authorRole: item.authorRole ?? '',
      message: item.message,
      rating: item.rating ?? null,
      displayOrder: item.displayOrder,
      isPublished: item.isPublished
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const body = {
      tenantId: requireTenantId(this.auth),
      authorName: v.authorName.trim(),
      authorRole: v.authorRole?.trim() || null,
      message: v.message.trim(),
      rating: v.rating || null,
      displayOrder: v.displayOrder,
      isPublished: v.isPublished
    };

    const id = this.editingId();
    const req$ = id
      ? this.http.put<ApiResponse<StoreFeedbackDto>>(`${API_ENDPOINTS.storeFeedback.update(id)}?id=${id}`, body)
      : this.http.post<ApiResponse<StoreFeedbackDto>>(API_ENDPOINTS.storeFeedback.create, body);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.load();
        this.notifications.success('Testimonial saved');
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.errorFromApi(err, 'Could not save testimonial');
      }
    });
  }

  confirmDelete(item: StoreFeedbackDto): void {
    this.deleteTarget.set(item);
  }

  doDelete(): void {
    const item = this.deleteTarget();
    if (!item) return;
    this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.storeFeedback.delete(item.id)).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Testimonial deleted');
      },
      error: (err) => {
        this.notifications.errorFromApi(err, 'Could not delete testimonial');
        this.deleteTarget.set(null);
      }
    });
  }

  stars(rating: number): number[] {
    return Array.from({ length: Math.min(5, Math.max(0, rating)) });
  }
}
