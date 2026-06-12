import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  EmailSettings,
  GeneralSettings,
  IntegrationSettings,
  PaymentSettings,
  PolicySettings,
  SettingsCategory,
  ShippingSettings,
  StoreSettings,
  TaxSettings,
  TeamMember
} from '../models/store-settings.model';

const DEFAULT_SETTINGS: StoreSettings = {
  general: {
    storeName: 'Acme Store',
    tagline: 'Quality products, fast delivery',
    logoUrl: '',
    coverImageUrl: '',
    description: '',
    timezone: 'America/Chicago',
    currency: 'USD'
  },
  shipping: {
    enabled: true,
    defaultShippingCost: 50,
    freeShippingEnabled: true,
    freeShippingThreshold: 500,
    zones: [
      { id: 'z1', name: 'Domestic', baseCost: 50, deliveryDays: 5 },
      { id: 'z2', name: 'International', baseCost: 150, deliveryDays: 10 }
    ]
  },
  payment: {
    stripe: true,
    razorpay: true,
    upi: true,
    card: true,
    wallet: false,
    cod: true,
    stripeTestMode: true,
    stripePublicKey: 'pk_test_***',
    codMinOrder: 0
  },
  email: {
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    username: '',
    password: '',
    fromEmail: 'orders@example.com',
    fromName: 'Acme Store'
  },
  tax: {
    calculateTax: true,
    taxType: 'GST',
    taxRate: 18,
    taxId: '',
    applyTaxToShipping: false,
    pricesIncludeTax: false,
    rules: [{ id: 'r1', region: 'India', rate: 18 }]
  },
  policies: {
    returnPolicy: '14-day returns on unused items.',
    refundPolicy: 'Refunds processed within 5-7 business days.',
    shippingPolicy: 'Ships within 2 business days.',
    privacyPolicy: '',
    termsAndConditions: '',
    warrantyInfo: '1-year limited warranty on electronics.'
  },
  team: [
    { id: 'u1', name: 'Store Admin', email: 'admin@example.com', role: 'admin' }
  ],
  integrations: {
    stripeConnected: true,
    razorpayConnected: false
  }
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private settings: StoreSettings = structuredClone(DEFAULT_SETTINGS);

  getAll(): Observable<StoreSettings> {
    return of(structuredClone(this.settings)).pipe(delay(150));
  }

  getShipping(): Observable<ShippingSettings> {
    return of(structuredClone(this.settings.shipping)).pipe(delay(50));
  }

  getTax(): Observable<TaxSettings> {
    return of(structuredClone(this.settings.tax)).pipe(delay(50));
  }

  getPayment(): Observable<PaymentSettings> {
    return of(structuredClone(this.settings.payment)).pipe(delay(50));
  }

  updateCategory<K extends SettingsCategory>(
    category: K,
    data: StoreSettings[K]
  ): Observable<StoreSettings> {
    this.settings = { ...this.settings, [category]: structuredClone(data) };
    return of(structuredClone(this.settings)).pipe(delay(200));
  }

  getGeneral(): Observable<GeneralSettings> {
    return of(structuredClone(this.settings.general)).pipe(delay(50));
  }

  getEmail(): Observable<EmailSettings> {
    return of(structuredClone(this.settings.email)).pipe(delay(50));
  }

  getPolicies(): Observable<PolicySettings> {
    return of(structuredClone(this.settings.policies)).pipe(delay(50));
  }

  getTeam(): Observable<TeamMember[]> {
    return of(structuredClone(this.settings.team)).pipe(delay(50));
  }

  getIntegrations(): Observable<IntegrationSettings> {
    return of(structuredClone(this.settings.integrations)).pipe(delay(50));
  }
}
