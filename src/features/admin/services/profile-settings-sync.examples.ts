/**
 * ProfileSettingsSyncService Usage Examples
 *
 * This file demonstrates various ways to use the ProfileSettingsSyncService
 * in different component scenarios. Not meant to be compiled/run directly,
 * but rather as reference implementations.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, debounceTime } from 'rxjs/operators';
import { ProfileSettingsSyncService, ConsolidatedBusinessData } from './profile-settings-sync.service';

// ============================================================================
// Example 1: Website Builder Component - Using Consolidated Data
// ============================================================================
@Component({
  selector: 'app-website-builder-example',
  template: `
    <div class="website-builder" *ngIf="businessData$ | async as data">
      <!-- Branding Section -->
      <section class="branding">
        <h1>{{ data.businessName }}</h1>
        <img *ngIf="data.logoDocumentUrl" [src]="data.logoDocumentUrl" alt="Business Logo" />
        <img *ngIf="data.coverImageDocumentUrl" [src]="data.coverImageDocumentUrl" alt="Cover" />
        <p class="tagline">{{ data.tagline }}</p>
        <p class="description">{{ data.description }}</p>
      </section>

      <!-- Store Configuration Section -->
      <section class="configuration">
        <h2>Store Configuration</h2>
        <p><strong>Store URL:</strong> {{ data.storeUrl }}</p>
        <p><strong>Timezone:</strong> {{ data.timezone }}</p>
        <p><strong>Currency:</strong> {{ data.currency }}</p>
      </section>

      <!-- Operational Settings Section -->
      <section class="operational-settings">
        <h2>Operational Settings</h2>

        <!-- Shipping -->
        <div *ngIf="data.shipping">
          <h3>Shipping</h3>
          <p>Enabled: {{ data.shipping.enabled }}</p>
          <p *ngIf="data.shipping.freeShippingEnabled">
            Free shipping over {{ data.shipping.freeShippingThreshold }}
          </p>
        </div>

        <!-- Payment -->
        <div *ngIf="data.payment">
          <h3>Payment Methods</h3>
          <ul>
            <li *ngIf="data.payment.stripe">Stripe {{ data.payment.stripeTestMode ? '(Test)' : '' }}</li>
            <li *ngIf="data.payment.razorpay">Razorpay</li>
            <li *ngIf="data.payment.upi">UPI</li>
            <li *ngIf="data.payment.cod">Cash on Delivery</li>
          </ul>
        </div>

        <!-- Policies -->
        <div *ngIf="data.policies">
          <h3>Policies</h3>
          <p><strong>Return Policy:</strong> {{ data.policies.returnPolicy }}</p>
          <p><strong>Shipping Policy:</strong> {{ data.policies.shippingPolicy }}</p>
        </div>
      </section>
    </div>
  `
})
export class WebsiteBuilderExampleComponent {
  // Subscribe to consolidated data - component automatically receives updates
  businessData$: Observable<ConsolidatedBusinessData> =
    this.syncService.getConsolidatedBusinessData();

  constructor(private syncService: ProfileSettingsSyncService) {}
}

// ============================================================================
// Example 2: Portfolio Header Component - Reacting to Profile Changes
// ============================================================================
@Component({
  selector: 'app-portfolio-header-example',
  template: `
    <header class="portfolio-header" *ngIf="profile$ | async as profile">
      <div class="logo-section">
        <img *ngIf="profile.logoDocumentUrl"
             [src]="profile.logoDocumentUrl"
             alt="{{ profile.businessName }}" />
      </div>
      <div class="info-section">
        <h1>{{ profile.businessName }}</h1>
        <p class="subtitle">{{ profile.description }}</p>
        <div class="contact-info" *ngIf="profile.email || profile.phone">
          <a *ngIf="profile.email" [href]="'mailto:' + profile.email">
            {{ profile.email }}
          </a>
          <span *ngIf="profile.phone">{{ profile.phone }}</span>
        </div>
      </div>
    </header>
  `
})
export class PortfolioHeaderExampleComponent {
  // Only subscribe to profile changes, ignore settings updates
  profile$ = this.syncService.onProfileChange();

  constructor(private syncService: ProfileSettingsSyncService) {}
}

// ============================================================================
// Example 3: Payment Gateway Component - Reacting to Settings Changes
// ============================================================================
@Component({
  selector: 'app-payment-gateway-example',
  template: `
    <div class="payment-gateway" *ngIf="settings$ | async as settings">
      <h2>Available Payment Methods</h2>

      <div class="payment-methods">
        <!-- Stripe -->
        <div *ngIf="settings.payment.stripe" class="payment-option">
          <h3>Credit/Debit Card</h3>
          <p>Powered by Stripe</p>
          <p *ngIf="settings.payment.stripeTestMode" class="warning">
            Currently in TEST MODE
          </p>
        </div>

        <!-- Razorpay -->
        <div *ngIf="settings.payment.razorpay" class="payment-option">
          <h3>Razorpay</h3>
          <p>Cards, Netbanking, UPI</p>
        </div>

        <!-- UPI -->
        <div *ngIf="settings.payment.upi" class="payment-option">
          <h3>UPI</h3>
          <p>Direct bank transfer</p>
        </div>

        <!-- COD -->
        <div *ngIf="settings.payment.cod" class="payment-option">
          <h3>Cash on Delivery</h3>
          <p *ngIf="settings.payment.codMinOrder">
            Minimum order: {{ settings.currency }} {{ settings.payment.codMinOrder }}
          </p>
        </div>
      </div>

      <!-- Tax & Shipping Info -->
      <div class="order-summary">
        <h3>Taxes & Shipping</h3>
        <p *ngIf="settings.tax.calculateTax">
          Tax ({{ settings.tax.taxType }}): {{ settings.tax.taxRate }}%
        </p>
        <p *ngIf="settings.shipping.enabled">
          Shipping Available
          <span *ngIf="settings.shipping.freeShippingEnabled">
            (Free over {{ settings.currency }} {{ settings.shipping.freeShippingThreshold }})
          </span>
        </p>
      </div>
    </div>
  `
})
export class PaymentGatewayExampleComponent {
  // Only subscribe to settings changes, ignore profile updates
  settings$ = this.syncService.onSettingsChange();

  constructor(private syncService: ProfileSettingsSyncService) {}
}

// ============================================================================
// Example 4: Admin Dashboard - Manual Subscription with Cleanup
// ============================================================================
@Component({
  selector: 'app-admin-dashboard-example',
  template: `
    <div class="admin-dashboard" *ngIf="businessData">
      <h1>Dashboard Overview</h1>
      <div class="stats">
        <div class="stat-card">
          <h3>Business Name</h3>
          <p>{{ businessData.businessName }}</p>
        </div>
        <div class="stat-card">
          <h3>Store URL</h3>
          <p>{{ businessData.storeUrl }}</p>
        </div>
        <div class="stat-card">
          <h3>Timezone</h3>
          <p>{{ businessData.timezone }}</p>
        </div>
        <div class="stat-card">
          <h3>Currency</h3>
          <p>{{ businessData.currency }}</p>
        </div>
      </div>

      <div class="last-updated">
        <small>Last updated: {{ businessData.lastUpdated | date:'short' }}</small>
      </div>
    </div>
  `
})
export class AdminDashboardExampleComponent implements OnInit, OnDestroy {
  businessData: ConsolidatedBusinessData | null = null;
  private destroy$ = new Subject<void>();

  constructor(private syncService: ProfileSettingsSyncService) {}

  ngOnInit() {
    // Manual subscription with cleanup
    this.syncService.getConsolidatedBusinessData()
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300) // Debounce rapid updates
      )
      .subscribe({
        next: (data) => {
          this.businessData = data;
          this.onDataLoaded(data);
        },
        error: (err) => {
          console.error('Failed to load business data:', err);
          this.onError(err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onDataLoaded(data: ConsolidatedBusinessData) {
    // React to loaded data
    console.log('Dashboard data loaded:', data.businessName);
  }

  private onError(error: any) {
    // Handle errors
  }
}

// ============================================================================
// Example 5: Shipping Calculator - Transformed Observables
// ============================================================================
@Component({
  selector: 'app-shipping-calculator-example',
  template: `
    <div class="shipping-calculator">
      <h2>Shipping Cost Calculator</h2>

      <div *ngIf="shippingInfo$ | async as info">
        <p *ngIf="!info.enabled" class="disabled">Shipping is not enabled</p>

        <div *ngIf="info.enabled">
          <div class="shipping-zones">
            <h3>Shipping Zones</h3>
            <div *ngFor="let zone of info.zones" class="zone">
              <p><strong>{{ zone.name }}</strong></p>
              <p>Cost: {{ info.currency }} {{ zone.baseCost }}</p>
              <p>Delivery: {{ zone.deliveryDays }} days</p>
            </div>
          </div>

          <div class="free-shipping">
            <p *ngIf="info.freeShippingEnabled">
              Free shipping on orders over {{ info.currency }} {{ info.freeShippingThreshold }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ShippingCalculatorExampleComponent {
  // Transform consolidated data to extract only shipping-relevant info
  shippingInfo$ = this.syncService.getConsolidatedBusinessData().pipe(
    map(data => ({
      enabled: data.shipping.enabled,
      defaultShippingCost: data.shipping.defaultShippingCost,
      freeShippingEnabled: data.shipping.freeShippingEnabled,
      freeShippingThreshold: data.shipping.freeShippingThreshold,
      zones: data.shipping.zones,
      currency: data.currency
    }))
  );

  constructor(private syncService: ProfileSettingsSyncService) {}
}

// ============================================================================
// Example 6: Store Settings Editor - Listening to Profile Changes
// ============================================================================
@Component({
  selector: 'app-store-settings-example',
  template: `
    <div class="store-settings">
      <h1>Store Settings</h1>

      <!-- Display profile changes with notification -->
      <div class="notifications" *ngIf="profileChangeNotification$ | async as notification">
        <div class="notification success">
          Profile updated: {{ notification.businessName }}
        </div>
      </div>

      <!-- Display current consolidated state -->
      <div *ngIf="currentData$ | async as data">
        <section>
          <h2>Business Information</h2>
          <p><strong>Name:</strong> {{ data.businessName }}</p>
          <p><strong>Type:</strong> {{ data.businessTypeId }}</p>
          <p><strong>Email:</strong> {{ data.email }}</p>
          <p><strong>Phone:</strong> {{ data.phone }}</p>
        </section>

        <section>
          <h2>Store Configuration</h2>
          <p><strong>URL:</strong> {{ data.storeUrl }}</p>
          <p><strong>Timezone:</strong> {{ data.timezone }}</p>
          <p><strong>Currency:</strong> {{ data.currency }}</p>
        </section>
      </div>
    </div>
  `
})
export class StoreSettingsExampleComponent {
  // Current consolidated data
  currentData$ = this.syncService.getConsolidatedBusinessData();

  // Extract profile change notifications with timestamp
  profileChangeNotification$ = this.syncService.onProfileChange().pipe(
    map(profile => ({
      businessName: profile.businessName,
      timestamp: new Date()
    }))
  );

  constructor(private syncService: ProfileSettingsSyncService) {}
}

// ============================================================================
// Example 7: Business Card Generator - Combining Multiple Data Sources
// ============================================================================
@Component({
  selector: 'app-business-card-generator-example',
  template: `
    <div class="business-card-generator">
      <div *ngIf="cardData$ | async as card" class="business-card">
        <!-- Front of card -->
        <div class="card-front">
          <img *ngIf="card.logo" [src]="card.logo" class="logo" />
          <h1>{{ card.businessName }}</h1>
          <p class="tagline">{{ card.tagline }}</p>
        </div>

        <!-- Back of card -->
        <div class="card-back">
          <h3>{{ card.businessName }}</h3>
          <p *ngIf="card.email">📧 {{ card.email }}</p>
          <p *ngIf="card.phone">📞 {{ card.phone }}</p>
          <p *ngIf="card.storeUrl">🌐 {{ card.storeUrl }}</p>
          <p *ngIf="card.timezone">🕐 {{ card.timezone }}</p>
          <p *ngIf="card.currency">💱 {{ card.currency }}</p>
        </div>

        <button (click)="downloadCard(card)">Download Card</button>
      </div>
    </div>
  `
})
export class BusinessCardGeneratorExampleComponent {
  // Extract and transform data for business card
  cardData$ = this.syncService.getConsolidatedBusinessData().pipe(
    map(data => ({
      businessName: data.businessName,
      tagline: data.tagline,
      email: data.email,
      phone: data.phone,
      storeUrl: data.storeUrl,
      timezone: data.timezone,
      currency: data.currency,
      logo: data.logoDocumentUrl
    }))
  );

  constructor(private syncService: ProfileSettingsSyncService) {}

  downloadCard(card: any) {
    // Implementation would handle card download
    console.log('Downloading card for:', card.businessName);
  }
}

// ============================================================================
// Example 8: Multi-Aspect Monitoring - Separate Concerns
// ============================================================================
@Component({
  selector: 'app-multi-aspect-monitoring-example',
  template: `
    <div class="monitoring">
      <h1>Data Monitoring</h1>

      <!-- Monitor Profile Changes -->
      <section class="profile-monitor">
        <h2>Profile Updates</h2>
        <div *ngIf="profileUpdate$ | async as update">
          <p>Changed: {{ update.changedField }}</p>
          <p>New Value: {{ update.newValue }}</p>
        </div>
      </section>

      <!-- Monitor Settings Changes -->
      <section class="settings-monitor">
        <h2>Settings Updates</h2>
        <div *ngIf="settingsUpdate$ | async as update">
          <p>Payment methods: {{ update.paymentMethods | join }}</p>
          <p>Shipping enabled: {{ update.shippingEnabled }}</p>
        </div>
      </section>

      <!-- Combined View -->
      <section class="combined">
        <h2>Combined Status</h2>
        <p *ngIf="isReady$ | async">✅ All systems ready</p>
        <p *ngIf="!(isReady$ | async)">⏳ Loading...</p>
      </section>
    </div>
  `
})
export class MultiAspectMonitoringExampleComponent {
  // Track profile changes
  profileUpdate$ = this.syncService.onProfileChange().pipe(
    map(profile => ({
      changedField: 'businessName',
      newValue: profile.businessName
    }))
  );

  // Track settings changes
  settingsUpdate$ = this.syncService.onSettingsChange().pipe(
    map(settings => ({
      paymentMethods: Object.keys(settings.payment).filter(
        key => (settings.payment as any)[key]
      ),
      shippingEnabled: settings.shipping.enabled
    }))
  );

  // Combined readiness check
  isReady$ = this.syncService.getConsolidatedBusinessData().pipe(
    map(data => Boolean(data.businessName && data.storeUrl))
  );

  constructor(private syncService: ProfileSettingsSyncService) {}
}

/**
 * INTEGRATION CHECKLIST
 *
 * When adding ProfileSettingsSyncService to a component, ensure:
 *
 * ✅ Inject ProfileSettingsSyncService
 * ✅ Choose the right method:
 *    - getConsolidatedBusinessData() for full data
 *    - onProfileChange() for profile-only changes
 *    - onSettingsChange() for settings-only changes
 * ✅ Use async pipe in template (simplest) or manual subscription (if complex logic)
 * ✅ If manual subscription, implement OnDestroy and unsubscribe with takeUntil()
 * ✅ Handle errors in subscription error handler
 * ✅ Test that component receives updated data when source changes
 *
 * TESTING TIPS
 * - Mock ProfileSettingsSyncService in unit tests
 * - Use of() to return test data immediately
 * - Test error scenarios with throwError()
 * - Verify async pipe updates UI when data changes
 */
