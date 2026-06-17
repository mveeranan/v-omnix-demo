import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { OrderService } from './data-access/order.service';
import { Order, OrderStatus } from './models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell eyebrow="Order" [title]="order()?.orderNumber ? '#' + order()!.orderNumber : 'Order detail'" description="Complete order information and actions.">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (!order()) {
        <p>Order not found.</p>
        <a routerLink="/admin/orders" class="text-indigo-600 hover:underline">Back to orders</a>
      } @else {
        @if (order(); as o) {
          <div class="grid gap-6 lg:grid-cols-3">
            <div class="space-y-6 lg:col-span-2">
              <section class="admin-glass-card rounded-xl p-6">
                <h2 class="font-semibold">Customer</h2>
                <p class="mt-2">{{ o.customerName }}</p>
                <p class="text-sm text-[var(--text-muted)]">{{ o.customerEmail }} · {{ o.customerPhone }}</p>
                <p class="mt-2 text-sm">{{ o.shippingAddress.address }}, {{ o.shippingAddress.city }}, {{ o.shippingAddress.country }}</p>
              </section>

              <section class="admin-glass-card rounded-xl p-6">
                <h2 class="mb-4 font-semibold">Items</h2>
                @for (line of o.items; track line.productId) {
                  <div class="flex justify-between border-t py-3 text-sm">
                    <span>{{ line.productName }} × {{ line.quantity }}</span>
                    <span>{{ format(line.lineTotal, o.currency) }}</span>
                  </div>
                }
                <div class="mt-4 space-y-1 border-t pt-4 text-sm">
                  <div class="flex justify-between"><span>Subtotal</span><span>{{ format(o.subtotal, o.currency) }}</span></div>
                  <div class="flex justify-between"><span>Shipping</span><span>{{ format(o.shipping, o.currency) }}</span></div>
                  <div class="flex justify-between"><span>Tax</span><span>{{ format(o.tax, o.currency) }}</span></div>
                  @if (o.discount) {
                    <div class="flex justify-between text-emerald-600"><span>Discount</span><span>-{{ format(o.discount, o.currency) }}</span></div>
                  }
                  <div class="flex justify-between text-lg font-bold"><span>Total</span><span>{{ format(o.total, o.currency) }}</span></div>
                </div>
              </section>

              <section class="admin-glass-card rounded-xl p-6">
                <h2 class="mb-4 font-semibold">Timeline</h2>
                <ul class="space-y-3">
                  @for (e of o.timeline; track e.id) {
                    <li class="flex items-center gap-2 text-sm">
                      <span class="h-2 w-2 rounded-full" [class.bg-emerald-500]="e.completed" [class.bg-zinc-300]="!e.completed"></span>
                      {{ e.label }} — {{ formatDate(e.at) }}
                    </li>
                  }
                </ul>
              </section>
            </div>

            <aside class="space-y-4">
              <section class="admin-glass-card rounded-xl p-6">
                <label class="block space-y-1 text-sm">
                  <span class="font-medium">Order status</span>
                  <select class="pf-editor-input w-full" [ngModel]="o.status" (ngModelChange)="updateStatus($event)">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </label>
                <p class="mt-3 text-sm">Payment: <strong class="capitalize">{{ o.paymentStatus }}</strong> ({{ o.paymentMethod }})</p>
                <button type="button" class="admin-action-secondary mt-4 w-full rounded-lg py-2 text-sm" (click)="print()">Print invoice</button>
              </section>

              <section class="admin-glass-card rounded-xl p-6">
                <h3 class="font-semibold">Notes</h3>
                <textarea class="pf-editor-input mt-2 w-full min-h-[80px]" [(ngModel)]="noteText" placeholder="Add a note…"></textarea>
                <button type="button" class="admin-section-action-btn mt-2 w-full rounded-lg py-2 text-sm" (click)="addNote()">Save note</button>
                <ul class="mt-4 space-y-2 text-sm">
                  @for (n of o.notes; track n.id) {
                    <li class="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900">{{ n.text }} <span class="text-xs text-[var(--text-muted)]">— {{ n.author }}</span></li>
                  }
                </ul>
              </section>
            </aside>
          </div>
        }
      }
    </app-admin-page-shell>
  `
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(OrderService);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  noteText = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.api.getById(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStatus(status: OrderStatus): void {
    const o = this.order();
    if (!o) return;
    this.api.updateStatus(o.id, status).subscribe((updated) => {
      if (updated) this.order.set(updated);
    });
  }

  addNote(): void {
    const o = this.order();
    if (!o || !this.noteText.trim()) return;
    this.api.addNote(o.id, this.noteText.trim()).subscribe((updated) => {
      if (updated) {
        this.order.set(updated);
        this.noteText = '';
      }
    });
  }

  print(): void {
    window.print();
  }

  format(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
