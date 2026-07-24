export type SettingsCategory = 'general' | 'shipping' | 'tax' | 'payment' | 'policies';

export interface GeneralSettings {
  timezone?: string;
  currency?: string;
}

export interface ShippingSettings {
  enabled: boolean;
  defaultShippingCost: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  zones: ShippingZone[];
}

export interface ShippingZone {
  id?: string;
  name?: string;
  baseCost: number;
  deliveryDays: number;
}

export interface PaymentSettings {
  stripe: boolean;
  razorpay: boolean;
  upi: boolean;
  card: boolean;
  wallet: boolean;
  cod: boolean;
  stripeTestMode: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;
  razorpayApiKey?: string;
  razorpaySecretKey?: string;
  codMinOrder: number;
}

export interface TaxSettings {
  calculateTax: boolean;
  taxType: 'GST' | 'VAT' | 'Sales Tax';
  taxRate: number;
  taxId?: string;
  applyTaxToShipping: boolean;
  pricesIncludeTax: boolean;
  rules: TaxRule[];
}

export interface TaxRule {
  id?: string;
  region?: string;
  rate: number;
}

export interface PolicySettings {
  returnPolicy?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  privacyPolicy?: string;
  termsAndConditions?: string;
  warrantyInfo?: string;
}

export interface StoreSettings {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  tax: TaxSettings;
  policies: PolicySettings;
}
