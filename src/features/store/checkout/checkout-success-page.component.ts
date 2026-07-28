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
      <div class="container mx-auto max-w-2xl">
        <div class="mox-card rounded-xl p-8 text-center">
          <h1 class="text-2xl font-semibold text-emerald-700">Order confirmed!</h1>
          @if (order(); as o) {
            <p class="mt-4 text-[var(--mox-muted)]">
              Thank you. Your order <strong>{{ o.orderNumber }}</strong> has been received.
            </p>
            <p class="mt-2 text-sm text-[var(--mox-muted)]">A confirmation email will be sent shortly.</p>
          } @else {
            <p class="mt-4 text-[var(--mox-muted)]">Your order has been placed successfully.</p>
          }
        </div>

        @if (order(); as o) {
          <div class="mox-card mt-6 rounded-xl p-6 text-left">
            <h2 class="text-lg font-semibold">Order items</h2>
            <div class="mt-4 divide-y divide-[var(--mox-border)]">
              @for (item of o.items; track item.productId + (item.variantId ?? '')) {
                <div class="flex items-center justify-between gap-4 py-3">
                  <div class="flex items-center gap-3 min-w-0">
                    @if (item.imageUrl) {
                      <img [src]="item.imageUrl" [alt]="item.productName" class="h-14 w-14 rounded-md object-cover" />
                    }
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium">{{ item.productName }}</p>
                      @if (item.variantName) {
                        <p class="text-xs text-[var(--mox-muted)]">{{ item.variantName }}</p>
                      }
                      <p class="text-xs text-[var(--mox-muted)]">Qty {{ item.quantity }} × {{ format(item.unitPrice, o.currency) }}</p>
                    </div>
                  </div>
                  <p class="shrink-0 text-sm font-semibold">{{ format(item.lineTotal, o.currency) }}</p>
                </div>
              }
            </div>

            <div class="mt-4 space-y-1 border-t border-[var(--mox-border)] pt-4 text-sm">
              <div class="flex justify-between text-[var(--mox-muted)]">
                <span>Subtotal</span><span>{{ format(o.subtotal, o.currency) }}</span>
              </div>
              @if (o.shipping) {
                <div class="flex justify-between text-[var(--mox-muted)]">
                  <span>Shipping</span><span>{{ format(o.shipping, o.currency) }}</span>
                </div>
              }
              <div class="flex justify-between text-[var(--mox-muted)]">
                <span>Tax</span><span>{{ format(o.tax, o.currency) }}</span>
              </div>
              @if (o.discount) {
                <div class="flex justify-between text-[var(--mox-muted)]">
                  <span>Discount</span><span>-{{ format(o.discount, o.currency) }}</span>
                </div>
              }
              <div class="flex justify-between pt-2 text-base font-semibold">
                <span>Total</span><span>{{ format(o.total, o.currency) }}</span>
              </div>
            </div>
          </div>

          <div class="mox-card mt-6 rounded-xl p-6 text-left">
            <h2 class="text-lg font-semibold">Shipping to</h2>
            <p class="mt-2 text-sm text-[var(--mox-muted)]">
              {{ o.shippingAddress.name }}<br />
              {{ o.shippingAddress.address }}
              @if (o.shippingAddress.addressLine2) { , {{ o.shippingAddress.addressLine2 }} }<br />
              {{ o.shippingAddress.city }}, {{ o.shippingAddress.state }} {{ o.shippingAddress.zip }}<br />
              {{ o.shippingAddress.country }}
            </p>
            <h2 class="mt-4 text-lg font-semibold">Payment method</h2>
            <p class="mt-2 text-sm capitalize text-[var(--mox-muted)]">
              {{ o.paymentMethod }} · {{ o.paymentStatus }}
            </p>
          </div>
        }

        <div class="mt-8 flex flex-wrap justify-center gap-3">
          @if (storeSlug()) {
            <a [routerLink]="['/store', storeSlug(), 'products']" class="mox-btn mox-btn--primary text-sm">Continue shopping</a>
          }
          <a routerLink="/home" class="mox-btn mox-btn--outline text-sm">Back to home</a>
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
