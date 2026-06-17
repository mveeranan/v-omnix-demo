import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AppTableComponent } from '../../../shared/ui/app-table.component';
import { PaginationComponent } from '../../../shared/ui/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { OrderService } from './data-access/order.service';
import { Order, OrderListResult, OrderStatus } from './models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminPageShellComponent, AppTableComponent, PaginationComponent, LoadingSpinnerComponent],
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

      <div class="mb-4 grid gap-3 md:grid-cols-3">
        <input class="pf-editor-input" placeholder="Search order, customer…" [(ngModel)]="search" (ngModelChange)="load()" />
        <select class="pf-editor-input" [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <app-table>
          <table class="admin-bookings-table w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr>
                <th class="p-3">Order</th>
                <th class="p-3">Date</th>
                <th class="p-3">Customer</th>
                <th class="p-3">Total</th>
                <th class="p-3">Status</th>
                <th class="p-3">Payment</th>
                <th class="p-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (o of result()?.items ?? []; track o.id) {
                <tr class="admin-bookings-table__row border-t">
                  <td class="p-3 font-medium">#{{ o.orderNumber }}</td>
                  <td class="p-3">{{ formatDate(o.createdAt) }}</td>
                  <td class="p-3">{{ o.customerName }}</td>
                  <td class="p-3">{{ format(o.total, o.currency) }}</td>
                  <td class="p-3"><span class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize dark:bg-zinc-800">{{ o.status }}</span></td>
                  <td class="p-3"><span class="rounded-full px-2 py-0.5 text-xs capitalize" [class.bg-emerald-100]="o.paymentStatus === 'paid'" [class.bg-amber-100]="o.paymentStatus === 'pending'">{{ o.paymentStatus }}</span></td>
                  <td class="p-3"><a [routerLink]="['/admin/orders', o.id]" class="text-indigo-600 hover:underline">View</a></td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <div class="mt-6">
          <app-pagination [total]="result()?.total ?? 0" [page]="page()" [pageSize]="25" (pageChange)="onPage($event)" />
        </div>
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
        pageSize: 25
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

  format(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
