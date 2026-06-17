import { environment } from './environment';

const base = environment.apiBaseUrl;

export const API_ENDPOINTS = {
  auth: {
    login: `${base}/Auth/login`,
    refresh: `${base}/Auth/refresh`,
    registerAdmin: `${base}/Auth/register-admin`
  },
  countries: {
    list: `${base}/countries`
  },
  businessTypes: {
    list: `${base}/business-types`
  },
  themePresets: {
    list: `${base}/theme-presets`
  },
  plans: {
    list: `${base}/plans`
  },
  stripe: {
    checkout: `${base}/Stripe/ChcekOut`
  },
  signalR: {
    hub: `${base}/hubs/connect`
  },
  portfolio: {
    getByTenant: (tenantId: string) => `${base}/portfolio/${tenantId}`,
    getBySlug: (slug: string) => `${base}/portfolio/${slug}`,
    save: `${base}/portfolio`,
    publish: `${base}/portfolio/publish`,
    upload: `${base}/portfolio/upload`
  },
  businessProfile: {
    getByTenant: (tenantId: string) => `${base}/business-profiles/${tenantId}`,
    upsert: `${base}/business-profiles`
  },
  documents: {
    upload: `${base}/documents/upload`
  },
  tenant: {
    current: `${base}/tenant`
  },
  user: {
    update: `${base}/User`
  },
  store: {
    productsBySlug: (storeSlug: string) => `${base}/stores/${encodeURIComponent(storeSlug)}/products`,
    productBySlug: (storeSlug: string, productSlug: string) =>
      `${base}/stores/${encodeURIComponent(storeSlug)}/products/${encodeURIComponent(productSlug)}`,
    getBySlug: (slug: string) => `${base}/stores/${encodeURIComponent(slug)}`,
    createOrder: `${base}/orders`
  },
  // TODO: wire when backend ready
  categories: {
    list: `${base}/categories`,
    create: `${base}/categories`,
    update: (id: string) => `${base}/categories/${id}`,
    delete: (id: string) => `${base}/categories/${id}`
  },
  brands: {
    list: `${base}/brands`,
    create: `${base}/brands`,
    update: (id: string) => `${base}/brands/${id}`,
    delete: (id: string) => `${base}/brands/${id}`
  },
  products: {
    list: `${base}/products`,
    get: (id: string) => `${base}/products/${id}`,
    create: `${base}/products`,
    update: (id: string) => `${base}/products/${id}`,
    delete: (id: string) => `${base}/products/${id}`
  },
  orders: {
    list: `${base}/orders`,
    get: (id: string) => `${base}/orders/${id}`,
    updateStatus: (id: string) => `${base}/orders/${id}/status`
  },
  returns: {
    list: `${base}/returns`,
    create: `${base}/returns`,
    approve: (id: string) => `${base}/returns/${id}/approve`,
    reject: (id: string) => `${base}/returns/${id}/reject`,
    complete: (id: string) => `${base}/returns/${id}/complete`
  },
  customers: {
    list: `${base}/customers`,
    get: (id: string) => `${base}/customers/${id}`
  },
  ecommerceConfiguration: {
    get: `${base}/ecommerce-configuration`,
    update: `${base}/ecommerce-configuration`
  },
  taxRules: {
    list: `${base}/tax-rules`,
    create: `${base}/tax-rules`,
    update: (id: string) => `${base}/tax-rules/${id}`,
    delete: (id: string) => `${base}/tax-rules/${id}`
  },
  website: {
    get: `${base}/website`,
    saveSection: `${base}/website/sections`,
    publish: `${base}/website/publish`
  },
  newsletter: {
    subscribe: `${base}/newsletter/subscribe`,
    list: `${base}/newsletter/subscribers`
  },
  subscription: {
    status: `${base}/subscription/status`
  },
  coupons: {
    list: `${base}/coupons`,
    create: `${base}/coupons`,
    update: (id: string) => `${base}/coupons/${id}`,
    delete: (id: string) => `${base}/coupons/${id}`
  },
  reviews: {
    list: `${base}/reviews`,
    create: `${base}/reviews`,
    update: (id: string) => `${base}/reviews/${id}`,
    delete: (id: string) => `${base}/reviews/${id}`
  }
} as const;
