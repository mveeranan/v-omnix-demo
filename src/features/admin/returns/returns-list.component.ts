import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent, AdminStatusBadgeVariant } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { ReturnAdminService } from '../data-access/return-admin.service';
import { ReturnDto } from '../models/return.model';
import { ReturnStatus } from '@shared/models/backend-enums';
import { NotificationService } from '@core/notifications/notification.service';

@Component({
  selector: 'app-returns-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Operations" title="Returns" description="Manage return requests and refund status.">
      @if (formOpen()) {
        <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-6" [formGroup]="form" (ngSubmit)="save()">
          <h3 class="text-lg font-semibold">{{ editingId() ? 'Edit return' : 'New return' }}</h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Order number</span>
              <input class="pf-editor-input w-full" formControlName="orderNumber" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Status</span>
              <select class="pf-editor-input w-full" formControlName="status">
                @for (s of statuses; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>
            </label>
          </div>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Customer name</span>
            <input class="pf-editor-input w-full" formControlName="customerName" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Customer email</span>
            <input class="pf-editor-input w-full" type="email" formControlName="customerEmail" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Reason</span>
            <textarea class="pf-editor-input w-full" formControlName="reason" rows="2"></textarea>
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Refund amount</span>
            <input class="pf-editor-input w-full" type="number" formControlName="refundAmount" />
          </label>
          <label class="block space-y-1">
            <span class="text-sm font-medium">Notes</span>
            <textarea class="pf-editor-input w-full" formControlName="notes" rows="2"></textarea>
          </label>
          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">Cancel</button>
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid">Save</button>
          </div>
        </form>
      }

      @if (!formOpen()) {
        <div class="admin-data-table-toolbar">
          <p class="admin-data-table-toolbar__summary">Showing {{ filtered().length }} of {{ returns().length }} returns</p>
          <div class="admin-data-table-toolbar__filters">
            <select class="pf-editor-input" [(ngModel)]="statusFilter" (ngModelChange)="applyFilter()">
              <option value="">All statuses</option>
              @for (s of statuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" (click)="openCreate()">+ New return</button>
          </div>
        </div>

        @if (loading()) {
          <app-loading-spinner label="Loading returns…" />
        } @else if (!filtered().length) {
          <div class="admin-glass-card rounded-xl p-8 text-center">
            <p class="font-medium">No returns found</p>
          </div>
        } @else {
          <app-table>
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th class="admin-data-table__index">#</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Reason</th>
                  <th>Refund</th>
                  <th class="admin-data-table__col-status">Status</th>
                  <th class="admin-data-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of filtered(); track r.id; let i = $index) {
                  <tr class="admin-data-table__row">
                    <td class="admin-data-table__index">{{ i + 1 }}</td>
                    <td><span class="admin-data-table__entity-title">#{{ r.orderNumber }}</span></td>
                    <td>{{ r.customerName }}</td>
                    <td class="text-[var(--text-secondary)]">{{ r.reason }}</td>
                    <td><span class="admin-data-table__price">{{ format(r.refundAmount, r.currency) }}</span></td>
                    <td class="admin-data-table__col-status">
                      <app-admin-status-badge [label]="r.status" [variant]="statusVariant(r.status)" />
                    </td>
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
      }
    </app-admin-page-shell>

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete return"
      [message]="'Delete return for order ' + (deleteTarget()?.orderNumber ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class ReturnsListComponent implements OnInit {
  private readonly api = inject(ReturnAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly statuses: ReturnStatus[] = ['Pending', 'Approved', 'Rejected', 'Shipped', 'Received', 'Completed'];
  readonly loading = signal(true);
  readonly returns = signal<ReturnDto[]>([]);
  readonly filtered = signal<ReturnDto[]>([]);
  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly deleteTarget = signal<ReturnDto | null>(null);
  statusFilter = '';

  readonly form = this.fb.nonNullable.group({
    orderNumber: ['', Validators.required],
    customerName: ['', Validators.required],
    customerEmail: ['', Validators.required],
    reason: ['', Validators.required],
    status: ['Pending' as ReturnStatus],
    refundAmount: [0, Validators.min(0)],
    notes: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.returns.set(items);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter(): void {
    const all = this.returns();
    this.filtered.set(this.statusFilter ? all.filter((r) => r.status === this.statusFilter) : all);
  }

  statusVariant(status: ReturnStatus): AdminStatusBadgeVariant {
    switch (status) {
      case 'Approved':
      case 'Completed':
      case 'Received':
        return 'success';
      case 'Pending':
      case 'Shipped':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      orderNumber: '',
      customerName: '',
      customerEmail: '',
      reason: '',
      status: 'Pending',
      refundAmount: 0,
      notes: ''
    });
    this.formOpen.set(true);
  }

  openEdit(r: ReturnDto): void {
    this.editingId.set(r.id);
    this.form.patchValue({
      orderNumber: r.orderNumber,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      reason: r.reason,
      status: r.status,
      refundAmount: r.refundAmount,
      notes: r.notes ?? ''
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const id = this.editingId();
    const payload = {
      tenantId: 'default',
      orderId: id ? (this.returns().find((r) => r.id === id)?.orderId ?? `ord-${Date.now()}`) : `ord-${Date.now()}`,
      orderNumber: v.orderNumber.trim(),
      customerName: v.customerName.trim(),
      customerEmail: v.customerEmail.trim(),
      reason: v.reason.trim(),
      status: v.status,
      items: id
        ? (this.returns().find((r) => r.id === id)?.items ?? [])
        : [{ productId: 'p-new', productName: 'Item', quantity: 1, amount: v.refundAmount }],
      refundAmount: v.refundAmount,
      currency: 'USD',
      notes: v.notes
    };
    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);
    req$.subscribe({
      next: () => {
        this.closeForm();
        this.load();
        this.notifications.success('Return saved');
      }
    });
  }

  confirmDelete(r: ReturnDto): void {
    this.deleteTarget.set(r);
  }

  doDelete(): void {
    const r = this.deleteTarget();
    if (!r) return;
    this.api.delete(r.id).subscribe({
      next: () => {
        this.deleteTarget.set(null);
        this.load();
        this.notifications.success('Return deleted');
      }
    });
  }

  format(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }
}
