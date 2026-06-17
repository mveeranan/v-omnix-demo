import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { PaginationComponent } from '@shared/ui/pagination.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { CustomerService } from './data-access/customer.service';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminPageShellComponent, AppTableComponent, PaginationComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell eyebrow="Operations" title="Customers" [description]="'Total: ' + (total()) + ' customers'">
      <input class="pf-editor-input mb-4 max-w-md" placeholder="Search name, email, phone" [(ngModel)]="search" (ngModelChange)="load()" />
      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <app-table>
          <table class="admin-bookings-table w-full text-left text-sm">
            <thead>
              <tr>
                <th class="p-3">Name</th>
                <th class="p-3">Email</th>
                <th class="p-3">Orders</th>
                <th class="p-3">Spent</th>
                <th class="p-3">Last order</th>
                <th class="p-3"></th>
              </tr>
            </thead>
            <tbody>
              @for (c of items(); track c.id) {
                <tr class="admin-bookings-table__row border-t">
                  <td class="p-3 font-medium">{{ c.name }}</td>
                  <td class="p-3">{{ c.email }}</td>
                  <td class="p-3">{{ c.totalOrders }}</td>
                  <td class="p-3">{{ format(c.totalSpent, c.currency) }}</td>
                  <td class="p-3">{{ formatDate(c.lastOrderDate) }}</td>
                  <td class="p-3"><a [routerLink]="['/admin/customers', c.id]" class="text-indigo-600 hover:underline">View</a></td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <div class="mt-6"><app-pagination [total]="total()" [page]="page()" [pageSize]="25" (pageChange)="onPage($event)" /></div>
      }
    </app-admin-page-shell>
  `
})
export class CustomersListComponent implements OnInit {
  private readonly api = inject(CustomerService);
  readonly loading = signal(true);
  readonly items = signal<import('./models/customer.model').Customer[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  search = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({ search: this.search || undefined, page: this.page(), pageSize: 25 }).subscribe({
      next: (r) => {
        this.items.set(r.items);
        this.total.set(r.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  format(v: number, c: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
