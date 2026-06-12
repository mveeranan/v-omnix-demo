import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, X } from 'lucide-angular';
import { CartStateService } from '../data-access/cart-state.service';

const FREE_SHIPPING_THRESHOLD = 50;

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, LucideAngularModule],
  template: `
    @if (open()) {
      <button type="button" class="mk-cart-drawer__backdrop" aria-label="Close cart" (click)="closed.emit()"></button>
      <aside class="mk-cart-drawer__panel" role="dialog" aria-label="Shopping cart">
        <div class="mk-cart-drawer__header">
          <h2 class="mk-cart-drawer__title">My Cart ({{ cart.summary().itemCount }})</h2>
          <button type="button" class="mk-header__icon-btn" aria-label="Close" (click)="closed.emit()">
            <lucide-icon [img]="closeIcon" class="h-5 w-5" />
          </button>
        </div>
        @if (shippingMessage()) {
          <p class="mk-cart-drawer__shipping">{{ shippingMessage() }}</p>
        }
        <div class="mk-cart-drawer__body">
          @if (!cart.lineItems().length) {
            <p class="text-sm text-[var(--mk-muted)]">Your cart is empty.</p>
          }
          @for (line of cart.lineItems(); track line.productId + (line.variantId ?? '')) {
            <div class="mk-cart-drawer__line">
              <img [src]="line.imageUrl" [alt]="line.productName" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold">{{ line.productName }}</p>
                <p class="text-xs text-[var(--mk-muted)]">{{ line.quantity }} x {{ line.unitPrice | currency: line.currency }}</p>
              </div>
            </div>
          }
        </div>
        <div class="mk-cart-drawer__footer">
          <div class="mk-cart-drawer__subtotal">
            <span>Sub Total</span>
            <span>{{ cart.summary().subtotal | currency: cart.summary().currency }}</span>
          </div>
          <div class="mk-cart-drawer__actions">
            <a [routerLink]="['/cart']" class="mk-btn mk-btn--outline" (click)="closed.emit()">View Cart</a>
            <a [routerLink]="['/checkout']" class="mk-btn mk-btn--primary" (click)="closed.emit()">Check Out</a>
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
}
