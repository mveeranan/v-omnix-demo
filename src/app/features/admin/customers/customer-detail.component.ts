import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { CustomerService } from './data-access/customer.service';
import { Customer } from './models/customer.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [RouterLink, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell eyebrow="Customer" [title]="customer()?.name ?? 'Customer'" description="Profile and order history.">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (!customer()) {
        <a routerLink="/admin/customers" class="text-indigo-600">Back</a>
      } @else {
        @if (customer(); as c) {
          <div class="grid gap-6 lg:grid-cols-2">
            <section class="admin-glass-card rounded-xl p-6">
              <h2 class="font-semibold">Profile</h2>
              <p class="mt-2">{{ c.email }}</p>
              <p class="text-sm text-[var(--text-muted)]">{{ c.phone }}</p>
              <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt class="text-[var(--text-muted)]">Total orders</dt><dd class="font-semibold">{{ c.totalOrders }}</dd></div>
                <div><dt class="text-[var(--text-muted)]">Total spent</dt><dd class="font-semibold">{{ format(c.totalSpent, c.currency) }}</dd></div>
                <div><dt class="text-[var(--text-muted)]">Joined</dt><dd>{{ formatDate(c.signupDate) }}</dd></div>
                <div><dt class="text-[var(--text-muted)]">Last order</dt><dd>{{ formatDate(c.lastOrderDate) }}</dd></div>
              </dl>
            </section>
            <section class="admin-glass-card rounded-xl p-6">
              <h2 class="font-semibold">Addresses</h2>
              @if (c.addresses.length) {
                @for (a of c.addresses; track a.id) {
                  <p class="mt-2 text-sm">{{ a.label }}: {{ a.street }}, {{ a.city }}</p>
                }
              } @else {
                <p class="mt-2 text-sm text-[var(--text-muted)]">No addresses on file.</p>
              }
            </section>
          </div>
        }
      }
    </app-admin-page-shell>
  `
})
export class CustomerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CustomerService);
  readonly loading = signal(true);
  readonly customer = signal<Customer | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.api.getById(id).subscribe({
      next: (c) => {
        this.customer.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  format(v: number, c: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
