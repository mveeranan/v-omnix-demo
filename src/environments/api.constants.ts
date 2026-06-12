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
  store: {
    productsBySlug: (storeSlug: string) => `${base}/stores/${encodeURIComponent(storeSlug)}/products`,
    productBySlug: (storeSlug: string, productSlug: string) =>
      `${base}/stores/${encodeURIComponent(storeSlug)}/products/${encodeURIComponent(productSlug)}`,
    createOrder: `${base}/orders`
  }
} as const;
