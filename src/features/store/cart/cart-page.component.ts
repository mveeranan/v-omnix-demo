import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartStateService } from '../data-access/cart-state.service';
import { CheckoutService } from '../data-access/checkout.service';
import { ProductApiService } from '../data-access/product-api.service';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { ProductCardComponent } from '../commerce/product-card.component';
import { StoreProduct } from '../models/product.model';
import { storeCheckoutRoute } from '../utils/store-commerce-route.util';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [FormsModule, RouterLink, ConfirmDialogComponent, ProductCardComponent],
  template: `
    <div class="mox-section min-h-screen px-6 py-10">
      <div class="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <h1 class="text-2xl font-semibold">Your cart</h1>

          @if (!cart.lineItems().length) {
            <p class="mt-6 text-[var(--mox-muted)]">Your cart is empty.</p>
            @if (cart.storeSlug()) {
              <a [routerLink]="['/store', cart.storeSlug(), 'products']" class="mox-btn mox-btn--primary mt-6 inline-flex text-sm">
                Start shopping
              </a>
            }
            @if (suggested().length) {
              <section class="mt-12">
                <h2 class="mb-4 text-lg font-semibold">You might like</h2>
                <div class="grid gap-4 sm:grid-cols-2">
                  @for (p of suggested(); track p.id) {
                    <app-product-card [product]="p" [storeSlug]="cart.storeSlug() ?? 'demo'" />
                  }
                </div>
              </section>
            }
          } @else {
            <ul class="mt-8 space-y-4">
              @for (line of cart.lineItems(); track line.productId + (line.variantId ?? '')) {
                <li class="mox-card flex flex-wrap items-center gap-4 p-4">
                  <img [src]="line.imageUrl" alt="" class="h-16 w-16 rounded-lg object-cover" />
                  <div class="min-w-0 flex-1">
                    @if (cart.storeSlug()) {
                      <a [routerLink]="['/store', cart.storeSlug(), 'products', line.productSlug]" class="font-medium hover:underline">{{ line.productName }}</a>
                    } @else {
                      <p class="font-medium">{{ line.productName }}</p>
                    }
                    <p class="text-sm text-[var(--mox-muted)]">{{ format(line.unitPrice, line.currency) }} each</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button type="button" class="mox-btn mox-btn--outline rounded px-3 py-1 text-sm" (click)="changeQty(line, -1)">−</button>
                    <span class="w-8 text-center text-sm">{{ line.quantity }}</span>
                    <button type="button" class="mox-btn mox-btn--outline rounded px-3 py-1 text-sm" (click)="changeQty(line, 1)">+</button>
                  </div>
                  <p class="font-semibold">{{ format(line.unitPrice * line.quantity, line.currency) }}</p>
                  <button type="button" class="text-sm text-rose-600" (click)="confirmRemove(line)">Remove</button>
                </li>
              }
            </ul>

            <div class="mt-6 flex flex-wrap gap-2">
              <input class="mox-input max-w-xs flex-1" placeholder="Coupon code" [(ngModel)]="couponCode" />
              <button type="button" class="mox-btn mox-btn--outline text-sm" (click)="applyCoupon()">Apply</button>
              @if (couponApplied()) {
                <button type="button" class="text-sm text-rose-600" (click)="removeCoupon()">Remove coupon</button>
              }
            </div>
            @if (couponMessage()) {
              <p class="mt-2 text-sm" [class.text-emerald-600]="couponApplied()" [class.text-rose-600]="!couponApplied()">{{ couponMessage() }}</p>
            }
          }
        </div>

        @if (cart.lineItems().length) {
          <aside class="pf-glass-card sticky top-6 h-fit rounded-xl p-6">
            <h2 class="font-semibold">Summary</h2>
            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between"><span>Subtotal</span><span>{{ format(cart.summary().subtotal, cart.summary().currency) }}</span></div>
              <div class="flex justify-between text-[var(--mox-muted)]"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div class="flex justify-between text-[var(--mox-muted)]"><span>Tax</span><span>Calculated at checkout</span></div>
              @if (couponDiscount() > 0) {
                <div class="flex justify-between text-emerald-600"><span>Discount</span><span>-{{ format(couponDiscount(), cart.summary().currency) }}</span></div>
              }
            </div>
            <div class="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
              <span>Estimated total</span>
              <span>{{ format(cart.summary().subtotal - couponDiscount(), cart.summary().currency) }}</span>
            </div>
            <div class="mt-6 flex flex-col gap-3">
              <a [routerLink]="checkoutLink()" class="mox-btn mox-btn--primary text-center text-sm">Proceed to checkout</a>
              @if (cart.storeSlug()) {
                <a [routerLink]="['/store', cart.storeSlug(), 'products']" class="mox-btn mox-btn--outline text-center text-sm">Continue shopping</a>
              }
            </div>
          </aside>
        }
      </div>
    </div>

    <app-confirm-dialog
      [open]="!!removeTarget()"
      title="Remove item"
      message="Remove this item from your cart?"
      confirmLabel="Remove"
      [danger]="true"
      (confirmed)="doRemove()"
      (cancelled)="removeTarget.set(null)"
    />
  `
})
export class CartPageComponent implements OnInit {
  readonly cart = inject(CartStateService);
  private readonly checkout = inject(CheckoutService);
  private readonly productApi = inject(ProductApiService);

  readonly removeTarget = signal<{ productId: string; variantId?: string } | null>(null);
  readonly suggested = signal<StoreProduct[]>([]);
  couponCode = '';
  readonly couponApplied = signal(false);
  readonly couponMessage = signal('');
  readonly couponDiscount = signal(0);

  ngOnInit(): void {
    const slug = this.cart.storeSlug() ?? 'demo';
    this.productApi.getFeatured(slug, 4).subscribe((items) => this.suggested.set(items));
    const saved = sessionStorage.getItem('work-orbit.coupon');
    if (saved) {
      this.couponCode = saved;
      this.applyCoupon();
    }
  }

  format(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  changeQty(line: { productId: string; variantId?: string; quantity: number }, delta: number): void {
    this.cart.updateQuantity(line.productId, line.quantity + delta, line.variantId);
  }

  confirmRemove(line: { productId: string; variantId?: string }): void {
    this.removeTarget.set(line);
  }

  doRemove(): void {
    const t = this.removeTarget();
    if (t) this.cart.removeItem(t.productId, t.variantId);
    this.removeTarget.set(null);
  }

  applyCoupon(): void {
    const slug = this.cart.storeSlug() ?? '';
    const subtotal = this.cart.summary().subtotal;
    this.checkout.validateCoupon(slug, this.couponCode, subtotal).subscribe((r) => {
      if (r.valid && r.discountValue != null) {
        const discount = r.discountType === 'Percentage'
          ? subtotal * (r.discountValue / 100)
          : r.discountValue;
        const capped = r.maximumDiscountAmount ? Math.min(discount, r.maximumDiscountAmount) : discount;
        this.couponApplied.set(true);
        this.couponDiscount.set(capped);
        this.couponMessage.set(r.message ?? 'Coupon applied');
        sessionStorage.setItem('work-orbit.coupon', this.couponCode.trim().toUpperCase());
      } else {
        this.couponApplied.set(false);
        this.couponDiscount.set(0);
        this.couponMessage.set(r.message ?? 'Invalid coupon code');
        sessionStorage.removeItem('work-orbit.coupon');
      }
    });
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.couponApplied.set(false);
    this.couponDiscount.set(0);
    this.couponMessage.set('');
    sessionStorage.removeItem('work-orbit.coupon');
  }

  checkoutLink(): string[] {
    return storeCheckoutRoute(this.cart.storeSlug());
  }
}
