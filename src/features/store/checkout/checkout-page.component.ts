import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStateService } from '../data-access/cart-state.service';
import { CheckoutService, ShippingOption } from '../data-access/checkout.service';
import { storeCartRoute, storeCheckoutSuccessRoute } from '../utils/store-commerce-route.util';
import { PaymentMethod } from '../../admin/orders/models/order.model';
import { CustomerService } from '../../admin/customers/data-access/customer.service';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="mox-section min-h-screen px-6 py-10">
      <div class="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
        <div class="lg:col-span-3">
          <h1 class="text-2xl font-semibold">Checkout</h1>

          @if (!cart.lineItems().length) {
            <p class="mt-6 text-[var(--mox-muted)]">Your cart is empty.</p>
            <a [routerLink]="cartLink()" class="mox-btn mox-btn--primary mt-4 inline-flex text-sm">Back to cart</a>
          } @else {
            <div class="mb-8 flex gap-2">
              @for (label of stepLabels; track label; let i = $index) {
                <div class="mox-card flex-1 py-2 text-center text-xs font-medium" [class.ring-2]="step() === i + 1" [style.--tw-ring-color]="step() === i + 1 ? 'var(--mox-accent)' : 'transparent'">
                  {{ i + 1 }}. {{ label }}
                </div>
              }
            </div>

            @if (error()) {
              <p class="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{{ error() }}</p>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              @if (step() === 1) {
                <div class="space-y-4">
                  <h2 class="font-semibold">Shipping address</h2>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <label class="block space-y-1"><span class="text-sm">First name</span><input class="mox-input w-full" formControlName="firstName" /></label>
                    <label class="block space-y-1"><span class="text-sm">Last name</span><input class="mox-input w-full" formControlName="lastName" /></label>
                  </div>
                  <label class="block space-y-1"><span class="text-sm">Phone</span><input class="mox-input w-full" formControlName="phone" /></label>
                  <label class="block space-y-1"><span class="text-sm">Email</span><input class="mox-input w-full" type="email" formControlName="email" /></label>
                  <label class="block space-y-1"><span class="text-sm">Address</span><input class="mox-input w-full" formControlName="address" /></label>
                  <div class="grid gap-4 sm:grid-cols-3">
                    <label class="block space-y-1"><span class="text-sm">City</span><input class="mox-input w-full" formControlName="city" /></label>
                    <label class="block space-y-1"><span class="text-sm">State</span><input class="mox-input w-full" formControlName="state" /></label>
                    <label class="block space-y-1"><span class="text-sm">ZIP</span><input class="mox-input w-full" formControlName="zip" /></label>
                  </div>
                  <label class="block space-y-1"><span class="text-sm">Country</span><input class="mox-input w-full" formControlName="country" /></label>
                </div>
              }

              @if (step() === 2) {
                <h2 class="mb-4 font-semibold">Shipping method</h2>
                <div class="space-y-2">
                  @for (opt of shippingOptions(); track opt.id) {
                    <label class="flex cursor-pointer items-center justify-between rounded-lg border p-4">
                      <span class="flex items-center gap-2">
                        <input type="radio" name="ship" [value]="opt.id" [checked]="shippingMethod() === opt.id" (change)="shippingMethod.set(opt.id); shippingCost.set(opt.cost)" />
                        {{ opt.label }}
                      </span>
                      <span class="font-medium">{{ format(opt.cost) }}</span>
                    </label>
                  }
                </div>
              }

              @if (step() === 3) {
                <h2 class="mb-4 font-semibold">Payment method</h2>
                <div class="space-y-2">
                  @for (m of paymentMethods; track m) {
                    <label class="flex items-center gap-2 rounded-lg border p-3 capitalize">
                      <input type="radio" name="pay" [value]="m" [checked]="paymentMethod() === m" (change)="paymentMethod.set(m)" />
                      {{ m }}
                    </label>
                  }
                </div>
              }

              @if (step() === 4) {
                <h2 class="mb-4 font-semibold">Review order</h2>
                <ul class="space-y-2 text-sm">
                  @for (line of cart.lineItems(); track line.productId) {
                    <li class="flex justify-between"><span>{{ line.productName }} × {{ line.quantity }}</span><span>{{ format(line.unitPrice * line.quantity) }}</span></li>
                  }
                </ul>
              }

              <div class="mt-8 flex flex-wrap gap-3">
                @if (step() > 1) {
                  <button type="button" class="mox-btn mox-btn--outline text-sm" (click)="step.set(step() - 1)">Back</button>
                }
                @if (step() < 4) {
                  <button type="button" class="mox-btn mox-btn--primary text-sm" (click)="nextStep()">Continue</button>
                } @else {
                  <button type="submit" class="mox-btn mox-btn--primary text-sm" [disabled]="form.invalid || submitting()">
                    {{ submitting() ? 'Placing order…' : 'Place order' }}
                  </button>
                }
              </div>
            </form>

            @if (submitting()) {
              <app-loading-spinner label="Processing payment…" class="mt-6" />
            }
          }
        </div>

        <aside class="pf-glass-card sticky top-6 h-fit rounded-xl p-6 lg:col-span-2">
          <h2 class="font-semibold">Order summary</h2>
          <ul class="mt-4 space-y-2 text-sm">
            @for (line of cart.lineItems(); track line.productId + (line.variantId ?? '')) {
              <li class="flex justify-between gap-2">
                <span class="truncate">{{ line.productName }} × {{ line.quantity }}</span>
                <span>{{ format(line.unitPrice * line.quantity) }}</span>
              </li>
            }
          </ul>
          <div class="mt-4 space-y-1 border-t pt-4 text-sm">
            <div class="flex justify-between"><span>Subtotal</span><span>{{ format(cart.summary().subtotal) }}</span></div>
            <div class="flex justify-between"><span>Shipping</span><span>{{ format(shippingCost()) }}</span></div>
            <div class="flex justify-between"><span>Tax</span><span>{{ format(tax()) }}</span></div>
            @if (discount() > 0) {
              <div class="flex justify-between text-emerald-600"><span>Discount</span><span>-{{ format(discount()) }}</span></div>
            }
            <div class="flex justify-between text-lg font-bold"><span>Total</span><span>{{ format(total()) }}</span></div>
          </div>
        </aside>
      </div>
    </div>
  `
})
export class CheckoutPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly cart = inject(CartStateService);
  private readonly checkout = inject(CheckoutService);
  private readonly customers = inject(CustomerService);

  readonly step = signal(1);
  readonly stepLabels = ['Address', 'Shipping', 'Payment', 'Review'];
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly shippingOptions = signal<ShippingOption[]>([]);
  readonly shippingMethod = signal('standard');
  readonly shippingCost = signal(0);
  readonly tax = signal(0);
  readonly discount = signal(0);
  readonly paymentMethod = signal<PaymentMethod>('card');
  readonly paymentMethods: PaymentMethod[] = ['card', 'upi', 'razorpay', 'cod'];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: [''],
    zip: [''],
    country: ['', Validators.required]
  });

  ngOnInit(): void {
    const subtotal = this.cart.summary().subtotal;
    const coupon = sessionStorage.getItem('work-orbit.coupon');
    if (coupon) {
      const slug = this.cart.storeSlug() ?? '';
      this.checkout.validateCoupon(slug, coupon, subtotal).subscribe((r) => {
        if (r.valid && r.discountValue != null) {
          const raw = r.discountType === 'Percentage' ? subtotal * (r.discountValue / 100) : r.discountValue;
          const capped = r.maximumDiscountAmount ? Math.min(raw, r.maximumDiscountAmount) : raw;
          this.discount.set(capped);
        }
      });
    }
    this.checkout.getShippingOptions(subtotal).subscribe((opts) => {
      this.shippingOptions.set(opts);
      if (opts[0]) {
        this.shippingMethod.set(opts[0].id);
        this.shippingCost.set(opts[0].cost);
      }
    });
    this.checkout.calculateTax(subtotal).subscribe((t) => this.tax.set(t));
  }

  total(): number {
    return this.cart.summary().subtotal + this.shippingCost() + this.tax() - this.discount();
  }

  format(value: number): string {
    const c = this.cart.summary().currency;
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(value);
  }

  nextStep(): void {
    if (this.step() === 1 && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step.set(Math.min(4, this.step() + 1));
  }

  cartLink(): string[] {
    return storeCartRoute(this.cart.storeSlug());
  }

  onSubmit(): void {
    if (this.form.invalid || !this.cart.lineItems().length) return;
    this.submitting.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    const name = `${v.firstName} ${v.lastName}`.trim();
    const summary = this.cart.summary();

    this.checkout
      .createOrder(
        {
          storeSlug: this.cart.storeSlug() ?? 'demo',
          customer: { name, phone: v.phone, email: v.email, address: v.address, city: v.city, country: v.country },
          items: this.cart.lineItems(),
          subtotal: summary.subtotal,
          currency: summary.currency
        },
        {
          shippingCost: this.shippingCost(),
          tax: this.tax(),
          discount: this.discount(),
          paymentMethod: this.paymentMethod(),
          shippingMethod: this.shippingMethod(),
          couponCode: sessionStorage.getItem('work-orbit.coupon') ?? undefined,
          customerFirstName: v.firstName,
          customerLastName: v.lastName,
          shippingState: v.state,
          shippingZip: v.zip
        }
      )
      .subscribe({
        next: (result) => {
          this.customers.upsertFromOrder(name, v.email, v.phone, this.total());
          sessionStorage.removeItem('work-orbit.coupon');
          this.cart.clear();
          this.submitting.set(false);
          void this.router.navigate(storeCheckoutSuccessRoute(this.cart.storeSlug()), {
            queryParams: { order: result.orderId }
          });
        },
        error: () => {
          this.error.set('Payment failed. Please try again or choose a different method.');
          this.submitting.set(false);
        }
      });
  }
}
