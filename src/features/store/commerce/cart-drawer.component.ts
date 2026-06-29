import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, X } from 'lucide-angular';
import { CartStateService } from '../data-access/cart-state.service';
import { storeCartRoute, storeCheckoutRoute } from '../utils/store-commerce-route.util';

const FREE_SHIPPING_THRESHOLD = 50;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, LucideAngularModule],
  template: `
    @if (open()) {
      <button type="button" class="mox-cart-drawer__backdrop" aria-label="Close cart" (click)="closed.emit()"></button>
      <aside class="mox-cart-drawer__panel" role="dialog" aria-label="Shopping cart">
        <div class="mox-cart-drawer__header">
          <h2 class="mox-cart-drawer__title">My Cart ({{ cart.summary().itemCount }})</h2>
          <button type="button" class="mox-header__icon-btn" aria-label="Close" (click)="closed.emit()">
            <lucide-icon [img]="closeIcon" class="h-5 w-5" />
          </button>
        </div>
        @if (shippingMessage()) {
          <p class="mox-cart-drawer__shipping">{{ shippingMessage() }}</p>
        }
        <div class="mox-cart-drawer__body">
          @if (!cart.lineItems().length) {
            <p class="text-sm text-[var(--mox-muted)]">Your cart is empty.</p>
          }
          @for (line of cart.lineItems(); track line.productId + (line.variantId ?? '')) {
            <div class="mox-cart-drawer__line">
              <img [src]="line.imageUrl" [alt]="line.productName" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold">{{ line.productName }}</p>
                <p class="text-xs text-[var(--mox-muted)]">{{ line.quantity }} x {{ line.unitPrice | currency: line.currency }}</p>
              </div>
            </div>
          }
        </div>
        <div class="mox-cart-drawer__footer">
          <div class="mox-cart-drawer__subtotal">
            <span>Sub Total</span>
            <span>{{ cart.summary().subtotal | currency: cart.summary().currency }}</span>
          </div>
          <div class="mox-cart-drawer__actions">
            <a [routerLink]="cartLink()" class="mox-btn mox-btn--outline" (click)="closed.emit()">View Cart</a>
            <a [routerLink]="checkoutLink()" class="mox-btn mox-btn--primary" (click)="closed.emit()">Check Out</a>
          </div>
        </div>
      </aside>
    }
  `
})
export class CartDrawerComponent {
  readonly open = input(false);
  readonly closed = output<void>();
  readonly closeIcon = X;
  readonly cart = inject(CartStateService);

  readonly shippingMessage = computed(() => {
    const subtotal = this.cart.summary().subtotal;
    if (subtotal <= 0) return '';
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    if (remaining > 0) {
      return `Spend ${remaining.toFixed(2)} more and enjoy free shipping!`;
    }
    return 'You qualify for free shipping!';
  });

  cartLink(): string[] {
    return storeCartRoute(this.cart.storeSlug());
  }

  checkoutLink(): string[] {
    return storeCheckoutRoute(this.cart.storeSlug());
  }
}
