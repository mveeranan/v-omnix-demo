import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreAuthService } from '../data-access/store-auth.service';
import { CheckoutService, MyOrder, MyOrderItem } from '../data-access/checkout.service';
import { ReturnApiService } from '@features/admin/data-access/return-api.service';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { getApiErrorMessage } from '@shared/utils/api-error.util';

/**
 * Storefront customer account page: login when logged out; profile + order history
 * ("My Orders") + logout when logged in. Uses the store customer session only
 * (StoreAuthService) — completely independent of any admin session.
 */
@Component({
  selector: 'app-store-account-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="mox-section min-h-screen px-6 py-10">
      <div class="container mx-auto max-w-3xl">
        @if (!auth.isLoggedIn()) {
          <!-- Login -->
          <div class="mox-card mx-auto max-w-md p-6">
            <h1 class="pf-display mb-1 text-2xl font-bold" style="color: var(--mox-primary)">Log in</h1>
            <p class="mb-5 text-sm" style="color: var(--mox-muted)">
              Access your orders and account details.
            </p>

            @if (loginError()) {
              <div class="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-3">
                <p class="text-sm text-rose-700">{{ loginError() }}</p>
              </div>
            }

            <form (ngSubmit)="login()" class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Email</label>
                <input class="mox-input" type="email" name="email" [(ngModel)]="email" placeholder="you@example.com" required />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Password</label>
                <input class="mox-input" type="password" name="password" [(ngModel)]="password" placeholder="Your password" required />
              </div>
              <button type="submit" class="mox-btn mox-btn--primary w-full text-sm" [disabled]="loggingIn()">
                {{ loggingIn() ? 'Logging in...' : 'Log in' }}
              </button>
            </form>

            <p class="mt-5 text-center text-xs" style="color: var(--mox-muted)">
              Don't have an account yet? One is created for you the first time you
              <a [routerLink]="shopLink()" class="underline" style="color: var(--mox-accent)">place an order</a>.
            </p>
          </div>
        } @else {
          <!-- Account -->
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 class="pf-display text-2xl font-bold" style="color: var(--mox-primary)">My Account</h1>
              <p class="text-sm" style="color: var(--mox-muted)">
                {{ auth.getProfile()?.firstName }} {{ auth.getProfile()?.lastName }} · {{ auth.getProfile()?.email }}
              </p>
            </div>
            <button type="button" class="mox-btn mox-btn--outline text-sm" (click)="logout()">Log out</button>
          </div>

          <div class="mox-card p-6">
            <h2 class="mb-4 text-lg font-semibold" style="color: var(--mox-primary)">My Orders</h2>

            @if (ordersLoading()) {
              <app-loading-spinner label="Loading your orders..." />
            } @else if (ordersError()) {
              <div class="rounded-lg border border-rose-300 bg-rose-50 p-4">
                <p class="text-sm text-rose-700">{{ ordersError() }}</p>
              </div>
            } @else if (!orders().length) {
              <div class="py-8 text-center">
                <p class="mb-4" style="color: var(--mox-muted)">You haven't placed any orders on this store yet.</p>
                <a [routerLink]="shopLink()" class="mox-btn mox-btn--primary inline-flex text-sm">Start Shopping</a>
              </div>
            } @else {
              <div class="space-y-4">
                @for (order of orders(); track order.id) {
                  <div class="rounded-lg border p-4" style="border-color: var(--mox-border)">
                    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p class="font-semibold" style="color: var(--mox-text)">{{ order.orderNumber }}</p>
                        <p class="text-xs" style="color: var(--mox-muted)">{{ order.placedAt | date: 'medium' }}</p>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="mox-chip--accent rounded-full px-3 py-1 text-xs font-medium">
                          {{ order.status }}
                        </span>
                        <span class="text-sm font-bold" style="color: var(--mox-primary)">
                          {{ format(order.grandTotal, order.currency) }}
                        </span>
                      </div>
                    </div>
                    <div class="space-y-1 border-t pt-3" style="border-color: var(--mox-border)">
                      @for (item of order.items; track $index) {
                        <div class="flex justify-between text-sm">
                          <span style="color: var(--mox-muted)">{{ item.productName || 'Item' }} × {{ item.quantity }}</span>
                          <span style="color: var(--mox-text)">{{ format(item.totalPrice, order.currency) }}</span>
                        </div>
                      }
                    </div>
                    @if (order.status === 'Delivered') {
                      <div class="mt-3 border-t pt-3" style="border-color: var(--mox-border)">
                        <button type="button" class="mox-btn mox-btn--outline text-xs" (click)="openReturnForm(order)">
                          Request Return
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>

          @if (returnFormOpen()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div class="mox-card w-full max-w-md p-6">
                <h3 class="mb-4 text-lg font-semibold" style="color: var(--mox-primary)">Request Return</h3>

                @if (returnError()) {
                  <div class="mb-4 rounded-lg border border-rose-300 bg-rose-50 p-3">
                    <p class="text-sm text-rose-700">{{ returnError() }}</p>
                  </div>
                }

                <form (ngSubmit)="submitReturnRequest()" class="space-y-4">
                  <div>
                    <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Select Item</label>
                    <select class="mox-input w-full" [(ngModel)]="selectedItemId" name="item" required>
                      <option value="">-- Choose an item --</option>
                      @for (item of selectedReturnOrder()?.items; track item.id) {
                        <option [value]="item.id">{{ item.productName }} ({{ item.quantity }}×)</option>
                      }
                    </select>
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Reason for Return *</label>
                    <textarea class="mox-input w-full" [(ngModel)]="returnReason" name="reason" placeholder="Damaged, wrong item, doesn't fit, etc." required rows="2"></textarea>
                  </div>

                  <div>
                    <label class="mb-1 block text-sm font-medium" style="color: var(--mox-text)">Additional Notes (optional)</label>
                    <textarea class="mox-input w-full" [(ngModel)]="returnNotes" name="notes" placeholder="Any additional details..." rows="2"></textarea>
                  </div>

                  <div class="flex gap-2">
                    <button type="button" class="mox-btn mox-btn--outline flex-1 text-sm" (click)="closeReturnForm()">Cancel</button>
                    <button type="submit" class="mox-btn mox-btn--primary flex-1 text-sm" [disabled]="submittingReturn()">
                      {{ submittingReturn() ? 'Submitting...' : 'Submit Return Request' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class StoreAccountPageComponent implements OnInit {
  readonly auth = inject(StoreAuthService);
  private readonly checkout = inject(CheckoutService);
  private readonly returnApi = inject(ReturnApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loggingIn = signal(false);
  readonly loginError = signal('');

  readonly orders = signal<MyOrder[]>([]);
  readonly ordersLoading = signal(false);
  readonly ordersError = signal('');

  readonly returnFormOpen = signal(false);
  readonly selectedReturnOrder = signal<MyOrder | null>(null);
  selectedItemId = '';
  returnReason = '';
  returnNotes = '';
  readonly submittingReturn = signal(false);
  readonly returnError = signal('');

  private get storeSlug(): string {
    // ':slug' belongs to the parent 'store/:slug' route, not this child route.
    return this.route.parent?.snapshot.paramMap.get('slug')
      ?? this.route.snapshot.paramMap.get('slug')
      ?? '';
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loadOrders();
    }
  }

  shopLink(): string[] {
    return ['/store', this.storeSlug, 'products'];
  }

  login(): void {
    if (!this.email.trim() || !this.password) return;
    this.loggingIn.set(true);
    this.loginError.set('');
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.password = '';
        this.loggingIn.set(false);
        this.loadOrders();
      },
      error: (err) => {
        this.loginError.set(getApiErrorMessage(err, 'Invalid email or password.'));
        this.loggingIn.set(false);
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.orders.set([]);
    void this.router.navigate(['/store', this.storeSlug]);
  }

  format(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  private loadOrders(): void {
    this.ordersLoading.set(true);
    this.ordersError.set('');
    this.checkout.getMyOrders(this.storeSlug).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.ordersLoading.set(false);
      },
      error: (err) => {
        this.ordersError.set(getApiErrorMessage(err, 'Could not load your orders.'));
        this.ordersLoading.set(false);
      }
    });
  }

  openReturnForm(order: MyOrder): void {
    this.selectedReturnOrder.set(order);
    this.selectedItemId = order.items[0]?.id ?? '';
    this.returnReason = '';
    this.returnNotes = '';
    this.returnError.set('');
    this.returnFormOpen.set(true);
  }

  closeReturnForm(): void {
    this.returnFormOpen.set(false);
    this.selectedReturnOrder.set(null);
  }

  submitReturnRequest(): void {
    const order = this.selectedReturnOrder();
    if (!order || !this.selectedItemId || !this.returnReason.trim()) {
      this.returnError.set('Please fill in all required fields.');
      return;
    }

    this.submittingReturn.set(true);
    this.returnError.set('');

    this.returnApi.create({
      orderId: order.id,
      orderItemId: this.selectedItemId,
      reason: this.returnReason.trim(),
      customerNotes: this.returnNotes.trim() || undefined,
      storeSlug: this.storeSlug
    }).subscribe({
      next: () => {
        this.submittingReturn.set(false);
        this.closeReturnForm();
        // Show success message and reload orders
        alert('Return request submitted successfully! You can track its status here.');
        this.loadOrders();
      },
      error: (err) => {
        this.submittingReturn.set(false);
        this.returnError.set(getApiErrorMessage(err, 'Failed to submit return request.'));
      }
    });
  }
}
