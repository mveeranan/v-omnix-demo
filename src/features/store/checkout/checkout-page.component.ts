import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStateService } from '../data-access/cart-state.service';
import {
  CheckoutService,
  CheckoutQuote,
  toPaymentProviderType
} from '../data-access/checkout.service';
import { storeCartRoute, storeCheckoutSuccessRoute } from '../utils/store-commerce-route.util';
import { PaymentMethod } from '../../admin/orders/models/order.model';
import { CustomerService } from '../../admin/customers/data-access/customer.service';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { CountryDialCodePickerComponent } from '@shared/ui/country-dial-code-picker.component';
import { CountriesService } from '@shared/data-access/countries.service';

interface ShippingZoneOption {
  id: string | null;
  label: string;
  cost: number;
}

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    CountryDialCodePickerComponent
  ],
  template: `
    <div class="mox-section min-h-screen px-6 py-10">
      <div class="container mx-auto max-w-7xl">
        <h1 class="pf-display mb-2 text-3xl font-bold" style="color: var(--mox-primary)">Checkout</h1>

        @if (!cart.lineItems().length) {
          <div class="mox-card p-6 text-center">
            <p class="mb-4 text-lg" style="color: var(--mox-text)">Your cart is empty.</p>
            <a [routerLink]="cartLink()" class="mox-btn mox-btn--primary inline-flex text-sm">Back to Shopping</a>
          </div>
        } @else {
          <div class="grid gap-8 lg:grid-cols-3">
            <!-- Main Checkout Form -->
            <div class="space-y-6 lg:col-span-2">
              <!-- Step Indicators -->
              <div class="flex gap-2">
                @for (label of stepLabels; track label; let i = $index) {
                  <div class="flex-1 text-center">
                    <div class="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full font-medium"
                         [style.background]="step() >= i + 1 ? 'var(--mox-accent)' : 'var(--mox-border)'"
                         [style.color]="step() >= i + 1 ? 'var(--pf-on-accent, #fff)' : 'var(--mox-muted)'">
                      {{ i + 1 }}
                    </div>
                    <p class="text-xs font-medium" style="color: var(--mox-muted)">{{ label }}</p>
                  </div>
                }
              </div>

              <!-- Error Messages -->
              @if (error()) {
                <div class="rounded-lg border border-rose-300 bg-rose-50 p-4">
                  <p class="text-sm text-rose-700">{{ error() }}</p>
                </div>
              }

              <!-- Cart Warnings -->
              @for (w of quote()?.warnings ?? []; track w) {
                <div class="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <p class="text-sm text-amber-800">{{ w }}</p>
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
                <!-- Step 1: Shipping Address -->
                @if (step() === 1) {
                  <div class="mox-card p-6">
                    <h2 class="mb-4 text-lg font-semibold" style="color: var(--mox-primary)">Shipping Address</h2>

                    <div class="space-y-4">
                      <!-- Name Row -->
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">First Name *</label>
                          <input class="mox-input" formControlName="firstName" placeholder="John" />
                          @if (form.controls.firstName.invalid && form.controls.firstName.touched) {
                            <p class="mt-1 text-xs text-rose-600">First name is required.</p>
                          }
                        </div>
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Last Name *</label>
                          <input class="mox-input" formControlName="lastName" placeholder="Doe" />
                          @if (form.controls.lastName.invalid && form.controls.lastName.touched) {
                            <p class="mt-1 text-xs text-rose-600">Last name is required.</p>
                          }
                        </div>
                      </div>

                      <!-- Email -->
                      <div>
                        <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Email *</label>
                        <input class="mox-input" type="email" formControlName="email" placeholder="john@example.com" />
                        @if (form.controls.email.invalid && form.controls.email.touched) {
                          <p class="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
                        }
                      </div>

                      <!-- Country Code + Mobile -->
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Country Code *</label>
                          <app-country-dial-code-picker
                            formControlName="countryCode"
                            [variant]="'pf-editor'"
                            [layout]="'standalone'"
                            [mode]="'dial'" />
                          @if (form.controls.countryCode.invalid && form.controls.countryCode.touched) {
                            <p class="mt-1 text-xs text-rose-600">Country code is required.</p>
                          }
                        </div>
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Mobile Number *</label>
                          <input class="mox-input" type="tel" formControlName="phone" placeholder="9876543210" />
                          @if (form.controls.phone.invalid && form.controls.phone.touched) {
                            <p class="mt-1 text-xs text-rose-600">Mobile number is required.</p>
                          }
                        </div>
                      </div>

                      <!-- Address Line 1 -->
                      <div>
                        <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Address Line 1 *</label>
                        <input class="mox-input" formControlName="address1" placeholder="123 Main Street" />
                        @if (form.controls.address1.invalid && form.controls.address1.touched) {
                          <p class="mt-1 text-xs text-rose-600">Address is required.</p>
                        }
                      </div>

                      <!-- Address Line 2 -->
                      <div>
                        <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Address Line 2</label>
                        <input class="mox-input" formControlName="address2" placeholder="Apartment, suite, etc." />
                      </div>

                      <!-- City, State, Postal Code -->
                      <div class="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">City *</label>
                          <input class="mox-input" formControlName="city" placeholder="New York" />
                          @if (form.controls.city.invalid && form.controls.city.touched) {
                            <p class="mt-1 text-xs text-rose-600">City is required.</p>
                          }
                        </div>
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">State/Province</label>
                          <input class="mox-input" formControlName="state" placeholder="NY" />
                        </div>
                        <div>
                          <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Postal Code *</label>
                          <input class="mox-input" formControlName="postalCode" placeholder="10001" />
                          @if (form.controls.postalCode.invalid && form.controls.postalCode.touched) {
                            <p class="mt-1 text-xs text-rose-600">Postal code is required.</p>
                          }
                        </div>
                      </div>

                      <!-- Country -->
                      <div>
                        <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Country *</label>
                        <app-country-dial-code-picker
                          formControlName="country"
                          [variant]="'pf-editor'"
                          [layout]="'standalone'"
                          [mode]="'iso'" />
                        @if (form.controls.country.invalid && form.controls.country.touched) {
                          <p class="mt-1 text-xs text-rose-600">Country is required.</p>
                        }
                      </div>
                    </div>
                  </div>
                }

                <!-- Step 2: Payment Method -->
                @if (step() === 2) {
                  <div class="mox-card p-6">
                    <h2 class="mb-4 text-lg font-semibold" style="color: var(--mox-primary)">Select Payment Method</h2>
                    <div class="grid gap-4 sm:grid-cols-2">
                      @for (m of paymentMethodOptions; track m.value) {
                        <label class="cursor-pointer rounded-lg border-2 p-4 text-center transition"
                               [style.borderColor]="paymentMethod() === m.value ? 'var(--mox-accent)' : 'var(--mox-border)'"
                               [style.background]="paymentMethod() === m.value ? 'color-mix(in srgb, var(--mox-accent) 8%, var(--mox-surface))' : 'var(--mox-surface)'">
                          <input type="radio" [checked]="paymentMethod() === m.value" (change)="paymentMethod.set(m.value)" class="sr-only" />
                          <div class="mb-2 text-2xl">{{ m.icon }}</div>
                          <p class="font-medium" style="color: var(--mox-text)">{{ m.label }}</p>
                        </label>
                      }
                    </div>
                  </div>
                }

                <!-- Step 3: Order Review -->
                @if (step() === 3) {
                  <div class="mox-card p-6">
                    <h2 class="mb-4 text-lg font-semibold" style="color: var(--mox-primary)">Order Review</h2>
                    <div class="space-y-4">
                      @for (line of cart.lineItems(); track line.productId + (line.variantId ?? '')) {
                        <div class="flex gap-4 border-b pb-4" style="border-color: var(--mox-border)">
                          @if (line.imageUrl) {
                            <img [src]="line.imageUrl" [alt]="line.productName" class="h-16 w-16 rounded-lg object-cover" />
                          }
                          <div class="flex-1">
                            <p class="font-medium" style="color: var(--mox-text)">{{ line.productName }}</p>
                            @if (line.variantName) {
                              <p class="text-sm" style="color: var(--mox-muted)">{{ line.variantName }}</p>
                            }
                            <p class="text-sm" style="color: var(--mox-muted)">Qty: {{ line.quantity }}</p>
                          </div>
                          <div class="text-right">
                            <p class="font-medium" style="color: var(--mox-text)">{{ format(line.unitPrice * line.quantity) }}</p>
                            <p class="text-xs" style="color: var(--mox-muted)">{{ format(line.unitPrice) }} ea.</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Action Buttons -->
                <div class="flex gap-3">
                  @if (step() > 1) {
                    <button type="button" (click)="step.set(step() - 1)" class="mox-btn mox-btn--outline text-sm">
                      Back
                    </button>
                  }
                  @if (step() < 3) {
                    <button type="button" (click)="nextStep()" class="mox-btn mox-btn--primary flex-1 text-sm">
                      Continue
                    </button>
                  } @else {
                    <button type="submit" [disabled]="form.invalid || submitting()"
                            class="mox-btn mox-btn--primary flex-1 text-sm disabled:opacity-50">
                      {{ submitting() ? 'Placing Order...' : 'Place Order' }}
                    </button>
                  }
                </div>
              </form>

              @if (submitting()) {
                <app-loading-spinner label="Processing your order..." class="mt-6" />
              }
            </div>

            <!-- Order Summary Sidebar -->
            <div class="lg:col-span-1">
              <div class="mox-card sticky top-6 p-6">
                <h3 class="mb-4 text-lg font-semibold" style="color: var(--mox-primary)">Order Summary</h3>

                <!-- Cart Items -->
                <div class="space-y-3 border-b pb-4" style="border-color: var(--mox-border)">
                  @for (line of cart.lineItems(); track line.productId + (line.variantId ?? '')) {
                    <div class="flex justify-between text-sm">
                      <span style="color: var(--mox-muted)">{{ line.productName }} × {{ line.quantity }}</span>
                      <span class="font-medium" style="color: var(--mox-text)">{{ format(line.unitPrice * line.quantity) }}</span>
                    </div>
                  }
                </div>

                <!-- Totals -->
                <div class="mt-4 space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span style="color: var(--mox-muted)">Subtotal</span>
                    <span class="font-medium" style="color: var(--mox-text)">{{ format(subtotal()) }}</span>
                  </div>
                  @if (shippingCost() > 0) {
                    <div class="flex justify-between">
                      <span style="color: var(--mox-muted)">Shipping</span>
                      <span class="font-medium" style="color: var(--mox-text)">{{ format(shippingCost()) }}</span>
                    </div>
                  }
                  @if (tax() > 0) {
                    <div class="flex justify-between">
                      <span style="color: var(--mox-muted)">Tax</span>
                      <span class="font-medium" style="color: var(--mox-text)">{{ format(tax()) }}</span>
                    </div>
                  }
                  @if (discount() > 0) {
                    <div class="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-{{ format(discount()) }}</span>
                    </div>
                  }

                  <!-- Grand Total -->
                  <div class="flex justify-between border-t pt-3 text-base font-bold" style="border-color: var(--mox-border); color: var(--mox-primary)">
                    <span>Total</span>
                    <span>{{ format(total()) }}</span>
                  </div>
                </div>

                @if (quoteLoading()) {
                  <p class="mt-3 text-xs" style="color: var(--mox-muted)">Updating totals...</p>
                }
              </div>
            </div>
          </div>
        }
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
  private readonly countriesService = inject(CountriesService);

  readonly step = signal(1);
  readonly stepLabels = ['Address', 'Payment', 'Review'];
  readonly submitting = signal(false);
  readonly error = signal('');

  // Shipping is auto-resolved to the store's default zone — no separate step shown to the customer.
  readonly shippingZones = signal<ShippingZoneOption[]>([]);
  readonly shippingZoneId = signal<string | null>(null);
  readonly quote = signal<CheckoutQuote | null>(null);
  readonly quoteLoading = signal(false);

  readonly paymentMethod = signal<PaymentMethod>('cod');
  readonly paymentMethodOptions: PaymentMethodOption[] = [
    { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
    { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
    { value: 'razorpay', label: 'Razorpay', icon: '⚡' },
    { value: 'upi', label: 'UPI', icon: '📱' }
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    countryCode: ['+1', Validators.required],
    address1: ['', Validators.required],
    address2: [''],
    city: ['', Validators.required],
    state: [''],
    postalCode: ['', Validators.required],
    country: ['', Validators.required]
  });

  ngOnInit(): void {
    this.countriesService.load();
    if (!this.cart.lineItems().length) return;

    this.checkout.getShippingZones().subscribe((zones) => {
      this.shippingZones.set(zones);
      if (zones[0]) this.shippingZoneId.set(zones[0].id);
      this.refreshQuote();
    });
  }

  private refreshQuote(): void {
    const slug = this.cart.storeSlug();
    if (!slug || !this.cart.lineItems().length) return;

    const items = this.cart.lineItems().map((l) => ({
      productId: l.productId,
      variantId: l.variantId ?? null,
      quantity: l.quantity
    }));

    this.quoteLoading.set(true);
    this.checkout.getQuote(slug, items, this.shippingZoneId()).subscribe({
      next: (q) => {
        this.quote.set(q);
        this.quoteLoading.set(false);
      },
      error: () => this.quoteLoading.set(false)
    });
  }

  subtotal(): number {
    return this.quote()?.subtotal ?? this.cart.summary().subtotal;
  }
  shippingCost(): number {
    return this.quote()?.shippingAmount ?? 0;
  }
  tax(): number {
    return this.quote()?.taxAmount ?? 0;
  }
  discount(): number {
    return this.quote()?.discountAmount ?? 0;
  }
  total(): number {
    return this.quote()?.grandTotal ?? this.subtotal();
  }

  format(value: number): string {
    const c = this.quote()?.currency ?? this.cart.summary().currency;
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(value);
  }

  nextStep(): void {
    if (this.step() === 1 && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step.set(Math.min(3, this.step() + 1));
  }

  cartLink(): string[] {
    return storeCartRoute(this.cart.storeSlug());
  }

  onSubmit(): void {
    if (this.form.invalid || !this.cart.lineItems().length) return;
    this.submitting.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    const items = this.cart.lineItems().map((l) => ({
      productId: l.productId,
      variantId: l.variantId ?? null,
      quantity: l.quantity
    }));

    this.checkout
      .placeOrder({
        storeSlug: this.cart.storeSlug() ?? 'demo',
        email: v.email,
        shippingAddress: {
          firstName: v.firstName,
          lastName: v.lastName,
          line1: v.address1,
          line2: v.address2,
          city: v.city,
          state: v.state,
          zip: v.postalCode,
          country: v.country,
          phone: `${v.countryCode} ${v.phone}`
        },
        shippingZoneId: this.shippingZoneId(),
        paymentProvider: toPaymentProviderType(this.paymentMethod()),
        couponCode: sessionStorage.getItem('work-orbit.coupon') ?? undefined,
        items
      })
      .subscribe({
        next: (result) => {
          this.customers.upsertFromOrder(
            `${v.firstName} ${v.lastName}`,
            v.email,
            `${v.countryCode} ${v.phone}`,
            result.quote.grandTotal
          );
          sessionStorage.removeItem('work-orbit.coupon');
          this.cart.clear();
          this.submitting.set(false);
          void this.router.navigate(storeCheckoutSuccessRoute(this.cart.storeSlug()), {
            queryParams: { order: result.orderId }
          });
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Could not place order. Please try again.');
          this.submitting.set(false);
        }
      });
  }
}
