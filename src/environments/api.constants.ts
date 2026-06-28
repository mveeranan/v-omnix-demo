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
  heroSlides: {
    upsert: `${base}/hero-slides`
  },
  socialMedia: {
    upsert: `${base}/social-media`
  },
  documents: {
    upload: `${base}/documents/upload`,
    delete: (documentId: string) => `${base}/documents/${encodeURIComponent(documentId)}`
  },
  tenant: {
    current: `${base}/tenant`
  },
  user: {
    update: `${base}/User`
  },
  store: {
    getBySlug: (slug: string) => `${base}/stores/${encodeURIComponent(slug)}`,
    createOrder: `${base}/orders`
  },
  productCategories: {
    list: (tenantId: string) => `${base}/product-categories?tenantId=${encodeURIComponent(tenantId)}`,
    create: `${base}/product-categories`,
    update: (id: string) => `${base}/product-categories/${encodeURIComponent(id)}`,
    delete: (id: string, tenantId: string) =>
      `${base}/product-categories/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(tenantId)}`
  },
  brands: {
    list: (tenantId: string) => `${base}/brands?tenantId=${encodeURIComponent(tenantId)}`,
    create: `${base}/brands`,
    update: (id: string) => `${base}/brands/${encodeURIComponent(id)}`,
    delete: (id: string, tenantId: string) =>
      `${base}/brands/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(tenantId)}`
  },
  productTags: {
    list: (tenantId: string) => `${base}/product-tags?tenantId=${encodeURIComponent(tenantId)}`,
    create: `${base}/product-tags`,
    update: (id: string) => `${base}/product-tags/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/product-tags/${encodeURIComponent(id)}`
  },
  productAttributes: {
    list: (tenantId: string) => `${base}/product-attributes?tenantId=${encodeURIComponent(tenantId)}`,
    create: `${base}/product-attributes`,
    update: (id: string) => `${base}/product-attributes/${encodeURIComponent(id)}`
  },
  products: {
    list: `${base}/products`,
    get: (id: string, tenantId: string) =>
      `${base}/products/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(tenantId)}`,
    create: `${base}/products`,
    update: (id: string) => `${base}/products/${encodeURIComponent(id)}`,
    delete: (id: string, tenantId: string) =>
      `${base}/products/${encodeURIComponent(id)}?tenantId=${encodeURIComponent(tenantId)}`,
    patchStatus: (id: string) => `${base}/products/${encodeURIComponent(id)}/status`,
    bulkStatus: `${base}/products/status`,
    createVariant: (productId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/variants`,
    updateVariant: (productId: string, variantId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    deleteVariant: (productId: string, variantId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    images: (id: string) => `${base}/products/${encodeURIComponent(id)}/images`,
    inventory: (id: string, tenantId: string) =>
      `${base}/products/${encodeURIComponent(id)}/inventory?tenantId=${encodeURIComponent(tenantId)}`,
    createInventory: (productId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/inventory`,
    updateInventory: (productId: string, inventoryId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/inventory/${encodeURIComponent(inventoryId)}`,
    deleteInventory: (productId: string, inventoryId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/inventory/${encodeURIComponent(inventoryId)}`,
    tags: (id: string) => `${base}/products/${encodeURIComponent(id)}/tags`
  },
  catalog: {
    products: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/products`,
    product: (tenantSlug: string, slug: string) =>
      `${base}/catalog/${encodeURIComponent(tenantSlug)}/products/${encodeURIComponent(slug)}`,
    categories: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/categories`,
    brands: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/brands`
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
