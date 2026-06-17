import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../admin/orders/data-access/order.service';
import { Order } from '../../admin/orders/models/order.model';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--bg-primary,#fafafa)] px-6 py-16">
      <div class="container mx-auto max-w-lg text-center">
        <div class="admin-glass-card rounded-xl p-8">
          <h1 class="text-2xl font-semibold text-emerald-700">Order confirmed!</h1>
          @if (order()) {
            <p class="mt-4 text-[var(--text-secondary)]">
              Thank you. Your order <strong>{{ order()!.orderNumber }}</strong> has been received.
            </p>
            <p class="mt-2 text-sm text-[var(--text-muted)]">A confirmation email will be sent shortly.</p>
            <p class="mt-4 text-lg font-semibold">{{ format(order()!.total, order()!.currency) }}</p>
          } @else {
            <p class="mt-4 text-[var(--text-secondary)]">Your order has been placed successfully.</p>
          }
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            @if (storeSlug()) {
              <a [routerLink]="['/store', storeSlug(), 'products']" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Continue shopping</a>
            }
            <a routerLink="/home" class="admin-action-secondary rounded-lg px-4 py-2 text-sm">Back to home</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutSuccessPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly order = signal<Order | null>(null);
  readonly storeSlug = signal('');

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('order');
    if (orderId) {
      this.orderService.getById(orderId).subscribe((o) => {
        if (o) {
          this.order.set(o);
          this.storeSlug.set(o.storeSlug);
        }
      });
    }
  }

  format(v: number, c: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v);
  }
}
