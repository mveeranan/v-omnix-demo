import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { CouponAdminService } from '../data-access/coupon-admin.service';
import { Coupon } from '../models/coupon.model';
import { DiscountType } from '@shared/models/backend-enums';
import { NotificationService } from '@core/notifications/notification.service';
import { LucideAngularModule, Ticket } from 'lucide-angular';

@Component({
  selector: 'app-coupons-list',
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
    <app-admin-page-shell eyebrow="Business" title="Coupons" description="Discount codes for checkout.">
      <div class="mb-4 flex justify-end">
        <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ Add coupon</button>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading coupons…" />
      } @else if (!coupons().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No coupons yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="openCreate()">Create coupon</button>
        </div>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Code</th>
                <th>Discount</th>
                <th>Uses</th>
                <th class="admin-data-table__col-status">Status</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of coupons(); track c.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="couponIcon" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title font-mono">{{ c.code }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatDiscount(c) }}</td>
                  <td>{{ c.useCount }}{{ c.maxUses ? ' / ' + c.maxUses : '' }}</td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge
                      [label]="c.isActive ? 'Active' : 'Inactive'"
                      [variant]="c.isActive ? 'active' : 'inactive'"
                    />
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(c)" />
                      <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(c)" />
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
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit coupon' : 'New coupon' }}</h3>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Code</span>
            <input class="pf-editor-input w-full font-mono uppercase" formControlName="code" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Description</span>
            <input class="pf-editor-input w-full" formControlName="description" />
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Discount type</span>
              <select class="pf-editor-input w-full" formControlName="discountType">
                <option value="Percentage">Percentage</option>
                <option value="FixedAmount">Fixed amount</option>
              </select>
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Value</span>
              <input class="pf-editor-input w-full" type="number" formControlName="discountValue" />
            </label>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Min order</span>
              <input class="pf-editor-input w-full" type="number" formControlName="minOrderAmount" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Max uses</span>
              <input class="pf-editor-input w-full" type="number" formControlName="maxUses" placeholder="Unlimited" />
            </label>
          </div>
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
      title="Delete coupon"
      [message]="'Delete coupon ' + (deleteTarget()?.code ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class CouponsListComponent implements OnInit {
  private readonly api = inject(CouponAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly couponIcon = Ticket;
  readonly loading = signal(true);
  readonly coupons = signal<Coupon[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<Coupon | null>(null);

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    description: [''],
    discountType: ['Percentage' as DiscountType],
    discountValue: [10, Validators.min(0)],
    minOrderAmount: [0],
    maxUses: [null as number | null],
    isActive: [true]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.coupons.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  formatDiscount(c: Coupon): string {
    if (c.discountType === 'Percentage') return `${c.discountValue}% off`;
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(c.discountValue);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      code: '',
      description: '',
      discountType: 'Percentage',
      discountValue: 10,
      minOrderAmount: 0,
      maxUses: null,
      isActive: true
    });
    this.modalOpen.set(true);
  }

  openEdit(c: Coupon): void {
    this.editingId.set(c.id);
    this.form.patchValue({
      code: c.code,
      description: c.description ?? '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount ?? 0,
      maxUses: c.maxUses ?? null,
      isActive: c.isActive
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
      code: v.code.trim().toUpperCase(),
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderAmount: v.minOrderAmount,
      maxUses: v.maxUses ?? undefined,
      isActive: v.isActive
    };
    const id = this.editingId();
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeModal();
        this.load();
        this.notifications.success('Coupon saved');
      }
    });
  }

  confirmDelete(c: Coupon): void {
    this.deleteTarget.set(c);
  }

  doDelete(): void {
    const c = this.deleteTarget();
    if (!c) return;
    this.api.delete(c.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Coupon deleted');
      }
    });
  }
}
