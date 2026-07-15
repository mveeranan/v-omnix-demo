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
    list: () => `${base}/product-categories`,
    create: `${base}/product-categories`,
    update: (id: string) => `${base}/product-categories/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/product-categories/${encodeURIComponent(id)}`
  },
  brands: {
    list: () => `${base}/brands`,
    create: `${base}/brands`,
    update: (id: string) => `${base}/brands/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/brands/${encodeURIComponent(id)}`
  },
  productTags: {
    list: () => `${base}/product-tags`,
    create: `${base}/product-tags`,
    update: (id: string) => `${base}/product-tags/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/product-tags/${encodeURIComponent(id)}`
  },
  productTypes: {
    list: () => `${base}/product-types`,
    create: `${base}/product-types`,
    update: (id: string) => `${base}/product-types/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/product-types/${encodeURIComponent(id)}`
  },
  products: {
    list: `${base}/products`,
    get: (id: string) => `${base}/products/${encodeURIComponent(id)}`,
    create: `${base}/products`,
    update: (id: string) => `${base}/products/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/products/${encodeURIComponent(id)}`,
    patchStatus: (id: string) => `${base}/products/${encodeURIComponent(id)}/status`,
    bulkStatus: `${base}/products/status`,
    createVariant: (productId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/variants`,
    updateVariant: (productId: string, variantId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    deleteVariant: (productId: string, variantId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    images: (id: string) => `${base}/products/${encodeURIComponent(id)}/images`,
    inventory: (id: string) => `${base}/products/${encodeURIComponent(id)}/inventory`,
    createInventory: (productId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/inventory`,
    updateInventory: (productId: string, inventoryId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/inventory/${encodeURIComponent(inventoryId)}`,
    deleteInventory: (productId: string, inventoryId: string) =>
      `${base}/products/${encodeURIComponent(productId)}/inventory/${encodeURIComponent(inventoryId)}`,
    tags: (id: string) => `${base}/products/${encodeURIComponent(id)}/tags`,
    toggleFeatured: (id: string) => `${base}/products/${encodeURIComponent(id)}/featured`
  },
  catalog: {
    products: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/products`,
    product: (tenantSlug: string, slug: string) =>
      `${base}/catalog/${encodeURIComponent(tenantSlug)}/products/${encodeURIComponent(slug)}`,
    categories: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/categories`,
    brands: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/brands`,
    reviews: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/reviews`,
    feedback: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/feedback`,
    newsletterSubscribe: (tenantSlug: string) =>
      `${base}/catalog/${encodeURIComponent(tenantSlug)}/newsletter/subscribe`,
    dealOfWeek: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/deal-of-week`,
    dealsCarousel: (tenantSlug: string) => `${base}/catalog/${encodeURIComponent(tenantSlug)}/deals-carousel`
  },
  storeFeedback: {
    list: () => `${base}/store-feedback`,
    create: `${base}/store-feedback`,
    update: (id: string) => `${base}/store-feedback/${encodeURIComponent(id)}`,
    delete: (id: string) => `${base}/store-feedback/${encodeURIComponent(id)}`
  },
  orders: {
    list: `${base}/orders`,
    get: (id: string) => `${base}/orders/${encodeURIComponent(id)}`,
    updateStatus: (id: string) => `${base}/orders/${id}/status`,
    addNote: (id: string) => `${base}/orders/${id}/notes`
  },
  checkout: {
    quote: `${base}/checkout/quote`,
    placeOrder: `${base}/checkout/place-order`,
    myOrders: `${base}/checkout/my-orders`,
    myProfile: `${base}/checkout/my-profile`
  },
  payments: {
    methods: `${base}/payments/methods`,
    initiate: `${base}/payments/initiate`,
    capture: `${base}/payments/capture`
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
    publish: `${base}/website/publish`,
    listSections: () => `${base}/website/sections`,
    reorderSections: `${base}/website/sections/reorder`,
    deleteSection: (sectionType: string) => `${base}/website/sections/${encodeURIComponent(sectionType)}`,
    theme: `${base}/website/theme`
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
    delete: (id: string) => `${base}/coupons/${id}`,
    validate: `${base}/coupons/validate`
  },
  reviews: {
    list: `${base}/reviews`,
    create: `${base}/reviews`,
    update: (id: string) => `${base}/reviews/${id}`,
    delete: (id: string) => `${base}/reviews/${id}`
  }
} as const;
