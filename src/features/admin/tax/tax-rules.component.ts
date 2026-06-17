import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { TaxRuleAdminService } from '../data-access/tax-rule-admin.service';
import { TaxRule } from '../models/tax-rule.model';
import { NotificationService } from '@core/notifications/notification.service';

@Component({
  selector: 'app-tax-rules',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminPageShellComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Configuration" title="Tax Rules" description="Tax rules by country and region.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Add tax rule</button>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading tax rules…" />
      } @else if (!rules().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No tax rules yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create tax rule</button>
        </div>
      } @else {
        <div class="admin-glass-card overflow-hidden rounded-xl">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-[var(--border)] bg-black/[0.02] dark:bg-white/[0.02]">
              <tr>
                <th class="p-3">Name</th>
                <th class="p-3">Country</th>
                <th class="p-3">Region</th>
                <th class="p-3">Type</th>
                <th class="p-3">Rate</th>
                <th class="p-3">Active</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rules(); track r.id) {
                <tr class="border-t border-[var(--border)]">
                  <td class="p-3 font-medium">{{ r.name }}</td>
                  <td class="p-3">{{ r.country }}</td>
                  <td class="p-3 text-[var(--text-muted)]">{{ r.region || '—' }}</td>
                  <td class="p-3">{{ r.taxType }}</td>
                  <td class="p-3">{{ r.rate }}%</td>
                  <td class="p-3">{{ r.isActive ? 'Yes' : 'No' }}</td>
                  <td class="p-3">
                    <button type="button" class="mr-3 text-indigo-600 hover:underline" (click)="openEdit(r)">Edit</button>
                    <button type="button" class="text-rose-600 hover:underline" (click)="confirmDelete(r)">Delete</button>
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
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit tax rule' : 'New tax rule' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Name</span>
            <input class="pf-editor-input w-full" formControlName="name" />
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Country code</span>
              <input class="pf-editor-input w-full" formControlName="country" placeholder="IN" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Region</span>
              <input class="pf-editor-input w-full" formControlName="region" />
            </label>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Tax type</span>
              <select class="pf-editor-input w-full" formControlName="taxType">
                <option value="GST">GST</option>
                <option value="VAT">VAT</option>
                <option value="Sales Tax">Sales Tax</option>
              </select>
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Rate (%)</span>
              <input class="pf-editor-input w-full" type="number" formControlName="rate" />
            </label>
          </div>
          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" formControlName="isActive" /> Active</label>
            <label class="flex items-center gap-2"><input type="checkbox" formControlName="applyToShipping" /> Apply to shipping</label>
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
      title="Delete tax rule"
      [message]="'Delete ' + (deleteTarget()?.name ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class TaxRulesComponent implements OnInit {
  private readonly api = inject(TaxRuleAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly rules = signal<TaxRule[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<TaxRule | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    country: ['', Validators.required],
    region: [''],
    taxType: ['GST' as TaxRule['taxType']],
    rate: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    applyToShipping: [false]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.rules.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      country: '',
      region: '',
      taxType: 'GST',
      rate: 0,
      isActive: true,
      applyToShipping: false
    });
    this.modalOpen.set(true);
  }

  openEdit(r: TaxRule): void {
    this.editingId.set(r.id);
    this.form.patchValue(r);
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
      country: v.country.trim().toUpperCase(),
      region: v.region.trim(),
      taxType: v.taxType,
      rate: v.rate,
      isActive: v.isActive,
      applyToShipping: v.applyToShipping
    };
    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.notifications.success('Tax rule saved');
      }
    });
  }

  confirmDelete(r: TaxRule): void {
    this.deleteTarget.set(r);
  }

  doDelete(): void {
    const r = this.deleteTarget();
    if (!r) return;
    this.api.delete(r.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Tax rule deleted');
      }
    });
  }
}
