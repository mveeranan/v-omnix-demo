import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { DemoDbService } from '@core/demo/demo-db.service';
import { activateTenantSubscription, findUserByTenant, toLoginData } from '@core/demo/handlers/auth.handler';

/**
 * Stand-in for Stripe's hosted Checkout page, used ONLY when environment.demoMode is true.
 * Real Stripe Checkout cannot run without a backend (session creation needs a secret key that
 * must never reach the browser), so this page mimics the same visual step and the same UX
 * outcome — enter card details, click Pay, land back in the app with an active subscription —
 * without ever touching Stripe, collecting a real card number, or sending anything anywhere.
 */
@Component({
  selector: 'app-demo-mock-checkout-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout-shell">
      <div class="checkout-card">
        <div class="demo-flag">DEMO CHECKOUT — no real payment is processed</div>
        <h1>Pay {{ currency }} {{ amount }}<span class="cycle">/{{ cycleLabel() }}</span></h1>
        <p class="plan-line">{{ planName }} plan</p>

        <label class="field">
          <span>Card number</span>
          <input type="text" [(ngModel)]="cardNumber" placeholder="4242 4242 4242 4242" maxlength="19" (input)="formatCard()" />
        </label>
        <div class="row">
          <label class="field">
            <span>Expiry</span>
            <input type="text" [(ngModel)]="expiry" placeholder="MM / YY" maxlength="7" />
          </label>
          <label class="field">
            <span>CVC</span>
            <input type="text" [(ngModel)]="cvc" placeholder="123" maxlength="4" />
          </label>
        </div>
        <label class="field">
          <span>Name on card</span>
          <input type="text" [(ngModel)]="cardName" placeholder="Demo Admin" />
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button class="pay-btn" type="button" [disabled]="processing()" (click)="pay()">
          {{ processing() ? 'Processing payment…' : 'Pay ' + currency + ' ' + amount }}
        </button>
        <button class="cancel-btn" type="button" [disabled]="processing()" (click)="cancel()">Cancel and go back</button>
      </div>
    </div>
  `,
  styles: [`
    .checkout-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f6f6f9; padding: 24px; }
    .checkout-card { width: 100%; max-width: 420px; background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
    .demo-flag { background: #7c3aed; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .04em; padding: 6px 10px; border-radius: 6px; text-align: center; margin-bottom: 18px; }
    h1 { font-size: 24px; margin: 0 0 2px; }
    .cycle { font-size: 14px; color: #6b7280; font-weight: 400; }
    .plan-line { color: #6b7280; font-size: 13px; margin: 0 0 20px; }
    .field { display: block; margin-bottom: 14px; }
    .field span { display: block; font-size: 12px; color: #374151; margin-bottom: 4px; }
    .field input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
    .row { display: flex; gap: 12px; }
    .row .field { flex: 1; }
    .error { color: #dc2626; font-size: 13px; margin: 0 0 12px; }
    .pay-btn { width: 100%; padding: 12px; background: #635bff; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; }
    .pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .cancel-btn { width: 100%; padding: 10px; background: transparent; color: #6b7280; border: none; font-size: 13px; margin-top: 8px; cursor: pointer; }
  `]
})
export class DemoMockCheckoutPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly demoDb = inject(DemoDbService);

  readonly tenantId = this.route.snapshot.queryParamMap.get('tenantId') ?? '';
  readonly planName = this.route.snapshot.queryParamMap.get('planName') ?? 'Starter';
  readonly amount = this.route.snapshot.queryParamMap.get('amount') ?? '0';
  readonly currency = this.route.snapshot.queryParamMap.get('currency') ?? 'USD';
  readonly cycle = this.route.snapshot.queryParamMap.get('cycle') ?? 'Monthly';

  cardNumber = '4242 4242 4242 4242';
  expiry = '12 / 34';
  cvc = '123';
  cardName = '';

  readonly processing = signal(false);
  readonly error = signal<string | null>(null);

  cycleLabel(): string {
    return this.cycle.toLowerCase() === 'yearly' ? 'year' : 'month';
  }

  formatCard(): void {
    const digits = this.cardNumber.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim();
  }

  pay(): void {
    if (!this.tenantId) {
      this.error.set('Missing checkout session. Please restart from plan selection.');
      return;
    }
    this.error.set(null);
    this.processing.set(true);

    // Simulate the round-trip to a payment processor.
    setTimeout(() => {
      const user = activateTenantSubscription(this.demoDb, this.tenantId);
      if (!user) {
        this.processing.set(false);
        this.error.set('Could not find this account. Please register again.');
        return;
      }

      this.authService.persistLogin(toLoginData(user));
      this.router.navigate(['/admin/dashboard']);
    }, 1400);
  }

  cancel(): void {
    this.router.navigate(['/select-plan']);
  }
}
