import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { NewsletterAdminService } from '../data-access/newsletter-admin.service';
import { NewsletterSubscriber } from '../models/newsletter-subscriber.model';
import { NotificationService } from '@core/notifications/notification.service';
import { LucideAngularModule, Mail } from 'lucide-angular';

@Component({
  selector: 'app-newsletter-list',
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
    <app-admin-page-shell eyebrow="Business" title="Newsletter" description="Newsletter subscribers from your store.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add subscriber</button>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading subscribers…" />
      } @else if (!subscribers().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No subscribers yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add subscriber</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Email</th>
                <th>Name</th>
                <th>Source</th>
                <th>Subscribed</th>
                <th class="admin-data-table__col-status">Status</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of subscribers(); track s.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="mailIcon" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ s.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-[var(--text-secondary)]">{{ s.name || '—' }}</td>
                  <td class="capitalize">{{ s.source || '—' }}</td>
                  <td>{{ formatDate(s.subscribedAt) }}</td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge
                      [label]="s.isActive ? 'Active' : 'Inactive'"
                      [variant]="s.isActive ? 'active' : 'inactive'"
                    />
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(s)" />
                      <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(s)" />
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
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit subscriber' : 'New subscriber' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Email</span>
            <input class="pf-editor-input w-full" type="email" formControlName="email" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Name</span>
            <input class="pf-editor-input w-full" formControlName="name" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Source</span>
            <select class="pf-editor-input w-full" formControlName="source">
              <option value="admin">Admin</option>
              <option value="checkout">Checkout</option>
              <option value="footer">Footer</option>
              <option value="popup">Popup</option>
            </select>
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
      title="Remove subscriber"
      [message]="'Remove ' + (deleteTarget()?.email ?? '') + ' from the list?'"
      confirmLabel="Remove"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class NewsletterListComponent implements OnInit {
  private readonly api = inject(NewsletterAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly mailIcon = Mail;
  readonly loading = signal(true);
  readonly subscribers = signal<NewsletterSubscriber[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<NewsletterSubscriber | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: [''],
    source: ['admin'],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.subscribers.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ email: '', name: '', source: 'admin', isActive: true });
    this.modalOpen.set(true);
  }

  openEdit(s: NewsletterSubscriber): void {
    this.editingId.set(s.id);
    this.form.patchValue({
      email: s.email,
      name: s.name ?? '',
      source: s.source ?? 'admin',
      isActive: s.isActive
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
      email: v.email.trim(),
      name: v.name.trim(),
      source: v.source,
      isActive: v.isActive
    };
    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.notifications.success('Subscriber saved');
      }
    });
  }

  confirmDelete(s: NewsletterSubscriber): void {
    this.deleteTarget.set(s);
  }

  doDelete(): void {
    const s = this.deleteTarget();
    if (!s) return;
    this.api.delete(s.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Subscriber removed');
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
