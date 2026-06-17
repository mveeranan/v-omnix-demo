import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { NewsletterAdminService } from '../data-access/newsletter-admin.service';
import { NewsletterSubscriber } from '../models/newsletter-subscriber.model';
import { NotificationService } from '@core/notifications/notification.service';

@Component({
  selector: 'app-newsletter-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Business" title="Newsletter" description="Newsletter subscribers from your store.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add subscriber</button>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading subscribers…" />
      } @else if (!subscribers().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No subscribers yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add subscriber</button>
        </div>
      } @else {
        <div class="admin-glass-card overflow-hidden rounded-xl">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.02]">
              <tr>
                <th class="p-3">Email</th>
                <th class="p-3">Name</th>
                <th class="p-3">Source</th>
                <th class="p-3">Subscribed</th>
                <th class="p-3">Active</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of subscribers(); track s.id) {
                <tr class="border-t border-[var(--border)]">
                  <td class="p-3 font-medium">{{ s.email }}</td>
                  <td class="p-3 text-[var(--text-muted)]">{{ s.name || '—' }}</td>
                  <td class="p-3 capitalize">{{ s.source || '—' }}</td>
                  <td class="p-3">{{ formatDate(s.subscribedAt) }}</td>
                  <td class="p-3">{{ s.isActive ? 'Yes' : 'No' }}</td>
                  <td class="p-3">
                    <button type="button" class="mr-3 text-indigo-600 hover:underline" (click)="openEdit(s)">Edit</button>
                    <button type="button" class="text-rose-600 hover:underline" (click)="confirmDelete(s)">Delete</button>
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
