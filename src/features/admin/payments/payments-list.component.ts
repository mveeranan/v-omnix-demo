import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminDataTablePaginationComponent } from '@shared/ui/admin-data-table-pagination.component';
import { AdminStatusBadgeComponent, AdminStatusBadgeVariant } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { PaymentService } from './data-access/payment.service';
import { PaymentListResult } from './models/payment.model';
import { NotificationService } from '@core/notifications/notification.service';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    FormsModule,
    AdminPageShellComponent,
    AppTableComponent,
    AdminDataTablePaginationComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Finance" title="Payments" description="View payment transactions and refunds.">
      <div class="mb-4 grid gap-3 sm:grid-cols-4">
        <div class="admin-glass-card rounded-xl p-4">
          <p class="text-xs text-[var(--text-muted)]">Received this month</p>
          <p class="text-xl font-bold">{{ format(metrics()?.totalReceivedThisMonth ?? 0) }}</p>
        </div>
        <div class="admin-glass-card rounded-xl p-4">
          <p class="text-xs text-[var(--text-muted)]">Pending</p>
          <p class="text-xl font-bold">{{ format(metrics()?.pendingAmount ?? 0) }}</p>
        </div>
        <div class="admin-glass-card rounded-xl p-4">
          <p class="text-xs text-[var(--text-muted)]">Failed</p>
          <p class="text-xl font-bold">{{ metrics()?.failedCount ?? 0 }}</p>
        </div>
      </div>

      <div class="admin-data-table-toolbar">
        <p class="admin-data-table-toolbar__summary">
          Showing {{ result()?.items?.length ?? 0 }} of {{ result()?.total ?? 0 }} payments
        </p>
        <div class="admin-data-table-toolbar__filters">
          <input class="pf-editor-input" placeholder="Search transactions…" [(ngModel)]="search" (ngModelChange)="load()" />
          <select class="pf-editor-input" [(ngModel)]="pageSize" (ngModelChange)="load()">
            <option [ngValue]="10">10 per page</option>
            <option [ngValue]="25">25 per page</option>
            <option [ngValue]="50">50 per page</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Date</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th class="admin-data-table__col-status">Status</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (t of result()?.items ?? []; track t.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ rowNumber(i) }}</td>
                  <td>{{ formatDate(t.createdAt) }}</td>
                  <td><span class="admin-data-table__entity-title">#{{ t.orderNumber }}</span></td>
                  <td>{{ t.customerName }}</td>
                  <td><span class="admin-data-table__price">{{ format(t.amount, t.currency) }}</span></td>
                  <td class="capitalize">{{ t.method }}</td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge [label]="t.status" [variant]="statusVariant(t.status)" />
                  </td>
                  <td class="admin-data-table__col-actions">
                    @if (t.status === 'paid') {
                      <div class="admin-data-table__actions">
                        <app-admin-table-action label="Refund" variant="delete" (action)="refund(t.id, t.amount)" />
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <app-admin-data-table-pagination
          [total]="result()?.total ?? 0"
          [page]="page()"
          [pageSize]="pageSize"
          itemLabel="payments"
          (pageChange)="onPage($event)"
        />
      }
    </app-admin-page-shell>
  `
})
export class PaymentsListComponent implements OnInit {
  private readonly api = inject(PaymentService);
  private readonly notifications = inject(NotificationService);
  readonly loading = signal(true);
  readonly result = signal<PaymentListResult | null>(null);
  readonly metrics = signal<PaymentListResult | null>(null);
  readonly page = signal(1);
  search = '';
  pageSize = 25;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({ search: this.search || undefined, page: this.page(), pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.result.set(r);
        this.metrics.set(r);
        this.loading.set(false);
      },
      error: (err) => {
        this.notifications.errorFromApi(err, 'Could not load payments.');
        this.loading.set(false);
      }
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  statusVariant(status: string): AdminStatusBadgeVariant {
    switch (status) {
      case 'paid':
        return 'active';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'refunded':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  refund(id: string, amount: number): void {
    this.api.processRefund(id, amount).subscribe(() => this.load());
  }

  format(v: number, c = 'USD'): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
