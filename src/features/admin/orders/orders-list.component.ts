import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminDataTablePaginationComponent } from '@shared/ui/admin-data-table-pagination.component';
import { AdminStatusBadgeComponent, AdminStatusBadgeVariant } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { OrderService } from './data-access/order.service';
import { Order, OrderListResult, OrderStatus } from './models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AdminPageShellComponent,
    AppTableComponent,
    AdminDataTablePaginationComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Operations" title="Orders" description="View and manage customer orders.">
      <div class="mb-4 grid gap-3 sm:grid-cols-4">
        <div class="admin-glass-card rounded-xl p-4">
          <p class="text-xs text-[var(--text-muted)]">Revenue this month</p>
          <p class="text-xl font-bold">{{ format(metrics()?.revenueThisMonth ?? 0) }}</p>
        </div>
        <div class="admin-glass-card rounded-xl p-4">
          <p class="text-xs text-[var(--text-muted)]">Orders this month</p>
          <p class="text-xl font-bold">{{ metrics()?.ordersThisMonth ?? 0 }}</p>
        </div>
      </div>

      <div class="admin-data-table-toolbar">
        <p class="admin-data-table-toolbar__summary">
          Showing {{ result()?.items?.length ?? 0 }} of {{ result()?.total ?? 0 }} orders
        </p>
        <div class="admin-data-table-toolbar__filters">
          <input class="pf-editor-input" placeholder="Search order, customer…" [(ngModel)]="search" (ngModelChange)="load()" />
          <select class="pf-editor-input" [(ngModel)]="statusFilter" (ngModelChange)="load()">
            <option value="">All statuses</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
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
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th class="admin-data-table__col-status">Status</th>
                <th>Payment</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (o of result()?.items ?? []; track o.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ rowNumber(i) }}</td>
                  <td><span class="admin-data-table__entity-title">#{{ o.orderNumber }}</span></td>
                  <td>{{ formatDate(o.createdAt) }}</td>
                  <td>{{ o.customerName }}</td>
                  <td><span class="admin-data-table__price">{{ format(o.total, o.currency) }}</span></td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge [label]="o.status" [variant]="orderStatusVariant(o.status)" />
                  </td>
                  <td>
                    <app-admin-status-badge [label]="o.paymentStatus" [variant]="paymentStatusVariant(o.paymentStatus)" />
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="View" variant="view" [routerLink]="['/admin/orders', o.id]" />
                    </div>
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
          itemLabel="orders"
          (pageChange)="onPage($event)"
        />
      }
    </app-admin-page-shell>
  `
})
export class OrdersListComponent implements OnInit {
  private readonly api = inject(OrderService);
  readonly statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  readonly loading = signal(true);
  readonly result = signal<OrderListResult | null>(null);
  readonly metrics = signal<OrderListResult | null>(null);
  readonly page = signal(1);
  search = '';
  statusFilter = '';
  pageSize = 25;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .list({
        search: this.search || undefined,
        status: (this.statusFilter as OrderStatus) || undefined,
        page: this.page(),
        pageSize: this.pageSize
      })
      .subscribe({
        next: (r) => {
          this.result.set(r);
          this.metrics.set(r);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  orderStatusVariant(status: OrderStatus): AdminStatusBadgeVariant {
    switch (status) {
      case 'delivered':
      case 'shipped':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  paymentStatusVariant(status: string): AdminStatusBadgeVariant {
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

  format(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
