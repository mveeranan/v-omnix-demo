export type SettingsCategory =
  | 'general'
  | 'shipping'
  | 'payment'
  | 'email'
  | 'tax'
  | 'policies'
  | 'team'
  | 'integrations';

export interface GeneralSettings {
  storeName: string;
  tagline: string;
  logoUrl: string;
  coverImageUrl: string;
  description: string;
  timezone: string;
  currency: string;
}

export interface ShippingSettings {
  enabled: boolean;
  defaultShippingCost: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  zones: { id: string; name: string; baseCost: number; deliveryDays: number }[];
}

export interface PaymentSettings {
  stripe: boolean;
  razorpay: boolean;
  upi: boolean;
  card: boolean;
  wallet: boolean;
  cod: boolean;
  stripeTestMode: boolean;
  stripePublicKey: string;
  codMinOrder: number;
}

export interface EmailSettings {
  smtpServer: string;
  smtpPort: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface TaxSettings {
  calculateTax: boolean;
  taxType: 'GST' | 'VAT' | 'Sales Tax';
  taxRate: number;
  taxId: string;
  applyTaxToShipping: boolean;
  pricesIncludeTax: boolean;
  rules: { id: string; region: string; rate: number }[];
}

export interface PolicySettings {
  returnPolicy: string;
  refundPolicy: string;
  shippingPolicy: string;
  privacyPolicy: string;
  termsAndConditions: string;
  warrantyInfo: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface IntegrationSettings {
  stripeConnected: boolean;
  razorpayConnected: boolean;
}

export interface StoreSettings {
  general: GeneralSettings;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  email: EmailSettings;
  tax: TaxSettings;
  policies: PolicySettings;
  team: TeamMember[];
  integrations: IntegrationSettings;
}
