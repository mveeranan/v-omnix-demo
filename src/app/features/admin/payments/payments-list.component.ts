import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AppTableComponent } from '../../../shared/ui/app-table.component';
import { PaginationComponent } from '../../../shared/ui/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { PaymentService } from './data-access/payment.service';
import { PaymentListResult } from './models/payment.model';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [FormsModule, AdminPageShellComponent, AppTableComponent, PaginationComponent, LoadingSpinnerComponent],
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

      <input class="pf-editor-input mb-4 max-w-md" placeholder="Search transactions…" [(ngModel)]="search" (ngModelChange)="load()" />

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <app-table>
          <table class="admin-bookings-table w-full text-left text-sm">
            <thead>
              <tr>
                <th class="p-3">Date</th>
                <th class="p-3">Order</th>
                <th class="p-3">Customer</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Method</th>
                <th class="p-3">Status</th>
                <th class="p-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (t of result()?.items ?? []; track t.id) {
                <tr class="admin-bookings-table__row border-t">
                  <td class="p-3">{{ formatDate(t.createdAt) }}</td>
                  <td class="p-3">#{{ t.orderNumber }}</td>
                  <td class="p-3">{{ t.customerName }}</td>
                  <td class="p-3">{{ format(t.amount, t.currency) }}</td>
                  <td class="p-3 capitalize">{{ t.method }}</td>
                  <td class="p-3 capitalize">{{ t.status }}</td>
                  <td class="p-3">
                    @if (t.status === 'paid') {
                      <button type="button" class="text-rose-600 hover:underline" (click)="refund(t.id, t.amount)">Refund</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <div class="mt-6"><app-pagination [total]="result()?.total ?? 0" [page]="page()" [pageSize]="25" (pageChange)="onPage($event)" /></div>
      }
    </app-admin-page-shell>
  `
})
export class PaymentsListComponent implements OnInit {
  private readonly api = inject(PaymentService);
  readonly loading = signal(true);
  readonly result = signal<PaymentListResult | null>(null);
  readonly metrics = signal<PaymentListResult | null>(null);
  readonly page = signal(1);
  search = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({ search: this.search || undefined, page: this.page(), pageSize: 25 }).subscribe({
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
