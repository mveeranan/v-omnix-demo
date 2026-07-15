export type {
  GeneralSettings,
  PaymentSettings,
  PolicySettings,
  SettingsCategory,
  ShippingSettings,
  StoreSettings,
  TaxSettings
} from '../settings/models/store-settings.model';

import type { StoreSettings } from '../settings/models/store-settings.model';

/** Alias for store-level ecommerce configuration (same shape as StoreSettings). */
export type EcommerceSettings = StoreSettings;
