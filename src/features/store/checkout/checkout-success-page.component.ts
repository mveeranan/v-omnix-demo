import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../admin/orders/data-access/order.service';
import { Order } from '../../admin/orders/models/order.model';
import { CartStateService } from '../data-access/cart-state.service';

@Component({
  selector: 'app-checkout-success-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mox-section min-h-[50vh] px-6 py-16">
      <div class="container mx-auto max-w-lg text-center">
        <div class="mox-card rounded-xl p-8">
          <h1 class="text-2xl font-semibold text-emerald-700">Order confirmed!</h1>
          @if (order()) {
            <p class="mt-4 text-[var(--mox-muted)]">
              Thank you. Your order <strong>{{ order()!.orderNumber }}</strong> has been received.
            </p>
            <p class="mt-2 text-sm text-[var(--mox-muted)]">A confirmation email will be sent shortly.</p>
            <p class="mt-4 text-lg font-semibold">{{ format(order()!.total, order()!.currency) }}</p>
          } @else {
            <p class="mt-4 text-[var(--mox-muted)]">Your order has been placed successfully.</p>
          }
          <div class="mt-8 flex flex-wrap justify-center gap-3">
            @if (storeSlug()) {
              <a [routerLink]="['/store', storeSlug(), 'products']" class="mox-btn mox-btn--primary text-sm">Continue shopping</a>
            }
            <a routerLink="/home" class="mox-btn mox-btn--outline text-sm">Back to home</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutSuccessPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly cart = inject(CartStateService);

  readonly order = signal<Order | null>(null);
  readonly storeSlug = signal('');

  ngOnInit(): void {
    // The backend order detail doesn't carry storeSlug — read it from cart state instead,
    // which StoreContextService populates for the whole /store/:slug layout (survives cart.clear()).
    this.storeSlug.set(this.cart.storeSlug() ?? '');

    const orderId = this.route.snapshot.queryParamMap.get('order');
    if (orderId) {
      this.orderService.getById(orderId).subscribe((o) => {
        if (o) this.order.set(o);
      });
    }
  }

  format(v: number, c: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(v);
  }
}
