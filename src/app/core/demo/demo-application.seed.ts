/**
 * One linked demo record per feature area so the full app can be tested end-to-end.
 * Runs once (localStorage flag). Clear `work-orbit.demo.seeded-v1` to re-seed.
 */
import { categoryStore } from '../../features/admin/data-access/category.store';
import { brandStore } from '../../features/admin/data-access/brand.store';
import { couponStore } from '../../features/admin/data-access/coupon.store';
import { returnStore } from '../../features/admin/data-access/return.store';
import { reviewAdminStore } from '../../features/admin/data-access/review-admin.store';
import { newsletterSubscriberStore } from '../../features/admin/data-access/newsletter-subscriber.store';
import { taxRuleStore } from '../../features/admin/data-access/tax-rule.store';
import { paymentStore } from '../../features/admin/payments/data-access/payment.store';
import { orderStore } from '../../features/admin/orders/data-access/order.store';
import { productCatalogStore } from '../../features/store/data-access/product-catalog.store';
import { createDefaultWebsitePortfolio } from '../../features/portfolio/models/portfolio-defaults';
import { PortfolioMapper } from '../../features/portfolio/data-access/portfolio.mapper';
import { BusinessProfileExtension } from '../../features/admin/models/business-profile-extension.model';
import { StoreProduct } from '../../features/store/models/product.model';
import { Order } from '../../features/admin/orders/models/order.model';
import { PaymentTransaction } from '../../features/admin/payments/models/payment.model';
import { Customer } from '../../features/admin/customers/models/customer.model';

export const DEMO_SEED_FLAG = 'work-orbit.demo.seeded-v2';
const PROFILE_EXT_KEY = 'work-orbit.business-profile.ext';
const PORTFOLIO_DRAFT_KEY = 'work-orbit.portfolio.draft';
const DEFAULT_TENANT_ID = 'default';

export const DEMO_IDS = {
  category: 'cat-demo-1',
  brand: 'brand-demo-1',
  product: 'p-demo-1',
  customer: 'c-demo-1',
  order: 'ord-demo-1',
  payment: 'pay-demo-1',
  return: 'ret-demo-1',
  review: 'rev-demo-1',
  coupon: 'cpn-demo-1',
  newsletter: 'nl-demo-1',
  taxRule: 'tax-demo-1',
  storeSlug: 'my-store'
} as const;

const now = new Date().toISOString();

export function seedDemoApplicationData(force = false): void {
  if (!force && localStorage.getItem(DEMO_SEED_FLAG)) {
    return;
  }

  seedCatalog();
  seedOrderFlow();
  seedMarketing();
  seedWebsiteAndProfile();

  localStorage.setItem(DEMO_SEED_FLAG, new Date().toISOString());
}

function seedCatalog(): void {
  categoryStore.replaceAll([
    {
      id: DEMO_IDS.category,
      tenantId: DEFAULT_TENANT_ID,
      name: 'Apparel',
      slug: 'apparel',
      description: 'Demo category for testing the catalog.',
      parentCategoryId: null,
      displayOrder: 0,
      isActive: true
    }
  ]);

  brandStore.replaceAll([
    {
      id: DEMO_IDS.brand,
      tenantId: DEFAULT_TENANT_ID,
      name: 'WorkOrbit Basics',
      slug: 'workorbit-basics',
      logoDocumentId: null,
      logoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80',
      description: 'Demo brand for product testing.',
      isActive: true
    }
  ]);

  const demoProduct: StoreProduct = {
    id: DEMO_IDS.product,
    slug: 'demo-hoodie',
    name: 'Demo Hoodie',
    description:
      'Sample product for end-to-end testing. Premium cotton hoodie with embroidered logo.',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
    galleryUrls: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    price: 49.99,
    compareAtPrice: 64.99,
    currency: 'USD',
    category: 'Apparel',
    categoryId: DEMO_IDS.category,
    brand: 'WorkOrbit Basics',
    brandId: DEMO_IDS.brand,
    sku: 'DEMO-001',
    featured: true,
    status: 'active',
    stockQuantity: 25,
    trackInventory: true,
    lowStockThreshold: 5,
    rating: 4.8,
    reviewCount: 1,
    createdAt: now,
    variants: [
      { id: 'v-demo-s', name: 'S', sku: 'DEMO-001-S', price: 49.99, stockQuantity: 8 },
      { id: 'v-demo-m', name: 'M', sku: 'DEMO-001-M', price: 49.99, stockQuantity: 12 }
    ],
    seo: {
      slug: 'demo-hoodie',
      metaTitle: 'Demo Hoodie | My Store',
      metaDescription: 'Try the demo product on your WorkOrbit storefront.',
      keywords: ['demo', 'hoodie', 'apparel']
    }
  };

  productCatalogStore.replaceAll([demoProduct]);
}

function seedOrderFlow(): void {
  const demoOrder: Order = {
    id: DEMO_IDS.order,
    orderNumber: 'WO-DEMO-001',
    storeSlug: DEMO_IDS.storeSlug,
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1 555 0100',
    shippingAddress: {
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      phone: '+1 555 0100',
      address: '123 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA'
    },
    items: [
      {
        productId: DEMO_IDS.product,
        productName: 'Demo Hoodie',
        productSlug: 'demo-hoodie',
        sku: 'DEMO-001',
        quantity: 1,
        unitPrice: 49.99,
        currency: 'USD',
        lineTotal: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600'
      }
    ],
    subtotal: 49.99,
    shipping: 5.99,
    tax: 4.12,
    discount: 0,
    total: 60.1,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    transactionId: 'txn_demo_001',
    shippingMethod: 'standard',
    timeline: [
      { id: 't1', label: 'Order placed', at: now, completed: true },
      { id: 't2', label: 'Payment received', at: now, completed: true },
      { id: 't3', label: 'Shipped', at: now, completed: true },
      { id: 't4', label: 'Delivered', at: now, completed: true }
    ],
    notes: [{ id: 'n1', text: 'Demo order for testing admin screens.', at: now, author: 'System' }],
    createdAt: now,
    updatedAt: now
  };

  orderStore.replaceAll([demoOrder]);

  const demoPayment: PaymentTransaction = {
    id: DEMO_IDS.payment,
    orderId: DEMO_IDS.order,
    orderNumber: 'WO-DEMO-001',
    customerName: 'Sarah Mitchell',
    amount: 60.1,
    currency: 'USD',
    method: 'card',
    status: 'paid',
    transactionId: 'txn_demo_001',
    createdAt: now
  };

  paymentStore.replaceAll([demoPayment]);

  returnStore.replaceAll([
    {
      id: DEMO_IDS.return,
      tenantId: DEFAULT_TENANT_ID,
      orderId: DEMO_IDS.order,
      orderNumber: 'WO-DEMO-001',
      customerName: 'Sarah Mitchell',
      customerEmail: 'sarah@example.com',
      reason: 'Wrong size — exchange requested',
      status: 'Pending',
      items: [{ productId: DEMO_IDS.product, productName: 'Demo Hoodie', quantity: 1, amount: 49.99 }],
      refundAmount: 49.99,
      currency: 'USD',
      notes: 'Demo return record',
      createdAt: now,
      updatedAt: now
    }
  ]);
}

function seedMarketing(): void {
  couponStore.replaceAll([
    {
      id: DEMO_IDS.coupon,
      tenantId: DEFAULT_TENANT_ID,
      code: 'DEMO10',
      description: '10% off — demo coupon for checkout testing',
      discountType: 'Percentage',
      discountValue: 10,
      minOrderAmount: 0,
      maxUses: 100,
      useCount: 0,
      isActive: true,
      createdAt: now
    }
  ]);

  reviewAdminStore.replaceAll([
    {
      id: DEMO_IDS.review,
      tenantId: DEFAULT_TENANT_ID,
      productId: DEMO_IDS.product,
      productName: 'Demo Hoodie',
      author: 'Sarah Mitchell',
      email: 'sarah@example.com',
      rating: 5,
      title: 'Great demo product',
      body: 'Perfect for testing reviews on the storefront and admin.',
      isPublished: true,
      isVerifiedPurchase: true,
      createdAt: now
    }
  ]);

  newsletterSubscriberStore.replaceAll([
    {
      id: DEMO_IDS.newsletter,
      tenantId: DEFAULT_TENANT_ID,
      email: 'demo-subscriber@example.com',
      name: 'Demo Subscriber',
      subscribedAt: now,
      isActive: true,
      source: 'website'
    }
  ]);

  taxRuleStore.replaceAll([
    {
      id: DEMO_IDS.taxRule,
      tenantId: DEFAULT_TENANT_ID,
      name: 'California Sales Tax',
      country: 'US',
      region: 'CA',
      rate: 8.25,
      taxType: 'Sales Tax',
      isActive: true,
      applyToShipping: false
    }
  ]);
}

function seedWebsiteAndProfile(): void {
  const ext: BusinessProfileExtension = {
    businessSlug: DEMO_IDS.storeSlug,
    tagline: 'Quality products, delivered with care',
    primaryColor: '#263238',
    secondaryColor: '#ff6f00',
    isPublished: true,
    enableEcommerce: true,
    isActive: true,
    metaTitle: 'My Store — Demo Shop',
    metaDescription: 'Explore the WorkOrbit demo storefront with sample products and content.',
    customDomain: ''
  };

  try {
    const map: Record<string, BusinessProfileExtension> = {};
    map[DEFAULT_TENANT_ID] = ext;
    localStorage.setItem(PROFILE_EXT_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }

  const portfolio = createDefaultWebsitePortfolio();
  portfolio.featuredProducts.productIds = [DEMO_IDS.product];
  portfolio.offerBanner.productIds = [DEMO_IDS.product];
  portfolio.saleCollection.productIds = [DEMO_IDS.product];
  portfolio.published = true;

  try {
    const mapper = new PortfolioMapper();
    localStorage.setItem(PORTFOLIO_DRAFT_KEY, JSON.stringify(mapper.toDto(portfolio)));
  } catch {
    /* ignore */
  }
}

/** Demo customer used by CustomerService seed. */
export function getDemoCustomer(): Customer {
  return {
    id: DEMO_IDS.customer,
    name: 'Sarah Mitchell',
    email: 'sarah@example.com',
    phone: '+1 555 0100',
    totalOrders: 1,
    totalSpent: 60.1,
    currency: 'USD',
    lastOrderDate: now,
    signupDate: now,
    addresses: [
      {
        id: 'addr-demo-1',
        label: 'Home',
        street: '123 Market Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'USA',
        isDefault: true
      }
    ],
    notes: [{ id: 'note-1', text: 'Demo customer linked to WO-DEMO-001', at: now }]
  };
}

export function clearDemoSeedFlag(): void {
  localStorage.removeItem(DEMO_SEED_FLAG);
}
