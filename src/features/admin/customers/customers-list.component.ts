import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminDataTablePaginationComponent } from '@shared/ui/admin-data-table-pagination.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { CustomerService } from './data-access/customer.service';
import { LucideAngularModule, User } from 'lucide-angular';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AdminPageShellComponent,
    AppTableComponent,
    AdminDataTablePaginationComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
    LucideAngularModule
  ],
  template: `
    <app-admin-page-shell eyebrow="Operations" title="Customers" [description]="'Total: ' + (total()) + ' customers'">
      <div class="admin-data-table-toolbar">
        <p class="admin-data-table-toolbar__summary">Showing {{ items().length }} of {{ total() }} customers</p>
        <div class="admin-data-table-toolbar__filters">
          <input class="pf-editor-input" placeholder="Search name, email, phone" [(ngModel)]="search" (ngModelChange)="load()" />
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
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Spent</th>
                <th>Last order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of items(); track c.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ rowNumber(i) }}</td>
                  <td>
                    <div class="admin-data-table__entity">
                      <span class="admin-data-table__entity-icon"><lucide-icon [img]="userIcon" /></span>
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ c.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ c.email }}</td>
                  <td>{{ c.totalOrders }}</td>
                  <td><span class="admin-data-table__price">{{ format(c.totalSpent, c.currency) }}</span></td>
                  <td>{{ formatDate(c.lastOrderDate) }}</td>
                  <td>
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="View" variant="view" [routerLink]="['/admin/customers', c.id]" />
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <app-admin-data-table-pagination
          [total]="total()"
          [page]="page()"
          [pageSize]="pageSize"
          itemLabel="customers"
          (pageChange)="onPage($event)"
        />
      }
    </app-admin-page-shell>
  `
})
export class CustomersListComponent implements OnInit {
  private readonly api = inject(CustomerService);
  readonly userIcon = User;
  readonly loading = signal(true);
  readonly items = signal<import('./models/customer.model').Customer[]>([]);
  readonly total = signal(0);
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

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  format(v: number, c: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
