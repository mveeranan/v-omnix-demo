import { StoreSettings } from '../settings/models/store-settings.model';

const STORAGE_KEY = 'work-orbit.ecommerce.config';

const DEFAULT: StoreSettings = {
  general: {
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    storeUrl: 'https://mystore.com'
  },
  shipping: {
    enabled: true,
    defaultShippingCost: 5.99,
    freeShippingEnabled: true,
    freeShippingThreshold: 50,
    zones: [{ id: 'z1', name: 'Domestic', baseCost: 5.99, deliveryDays: 5 }]
  },
  payment: {
    stripe: false,
    razorpay: false,
    upi: true,
    card: true,
    wallet: false,
    cod: true,
    stripeTestMode: true,
    stripePublicKey: '',
    codMinOrder: 0
  },
  tax: {
    calculateTax: true,
    taxType: 'Sales Tax',
    taxRate: 8.25,
    taxId: '',
    applyTaxToShipping: false,
    pricesIncludeTax: false,
    rules: [{ id: 'tax-1', region: 'US-CA', rate: 8.25 }]
  },
  policies: {
    returnPolicy: '30-day returns on unused items.',
    refundPolicy: 'Refunds within 5-7 business days.',
    shippingPolicy: 'Free shipping on orders over $50.',
    privacyPolicy: '',
    termsAndConditions: '',
    warrantyInfo: ''
  }
};

class EcommerceConfigStore {
  private settings: StoreSettings = this.load();

  get(): StoreSettings {
    return structuredClone(this.settings);
  }

  update(patch: Partial<StoreSettings>): StoreSettings {
    this.settings = { ...this.settings, ...patch };
    this.persist();
    return this.get();
  }

  updateSection<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]): StoreSettings {
    this.settings = { ...this.settings, [key]: value };
    this.persist();
    return this.get();
  }

  isConfigured(): boolean {
    return Boolean(this.settings.general.storeUrl?.trim());
  }

  private load(): StoreSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT);
      const parsed = JSON.parse(raw) as Partial<StoreSettings>;
      return {
        ...structuredClone(DEFAULT),
        ...parsed,
        general: { ...DEFAULT.general, ...parsed.general },
        shipping: { ...DEFAULT.shipping, ...parsed.shipping },
        payment: { ...DEFAULT.payment, ...parsed.payment },
        tax: { ...DEFAULT.tax, ...parsed.tax },
        policies: { ...DEFAULT.policies, ...parsed.policies }
      };
    } catch {
      return structuredClone(DEFAULT);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      /* ignore */
    }
  }
}

export const ecommerceConfigStore = new EcommerceConfigStore();
