import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  User,
  Package,
  ShoppingCart,
  Globe,
  FolderTree,
  Tag,
  Tags,
  RotateCcw,
  Star,
  Ticket,
  Mail,
  Receipt,
  Percent,
  SlidersHorizontal
} from 'lucide-angular';

export type AdminNavSection = 'overview' | 'operations' | 'business' | 'settings';

export interface AdminNavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  description: string;
  section: AdminNavSection;
  /** Plan feature key for gating (Phase 6) */
  featureKey?: string;
}

export const ADMIN_NAV_SECTIONS: { id: AdminNavSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'operations', label: 'Operations' },
  { id: 'business', label: 'Business' },
  { id: 'settings', label: 'Settings' }
];

export const ADMIN_NAV_ITEMS: AdminNavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: 'dashboard',
    icon: LayoutDashboard,
    description: 'Your business at a glance — orders, revenue, and activity.',
    section: 'overview'
  },
  {
    id: 'profile',
    label: 'Profile',
    path: 'profile',
    icon: User,
    description: 'Complete your workspace setup and manage profile details.',
    section: 'overview',
    featureKey: 'profile'
  },
  {
    id: 'billing',
    label: 'Billing',
    path: 'billing',
    icon: Receipt,
    description: 'SaaS subscription and plan management.',
    section: 'overview'
  },
  {
    id: 'orders',
    label: 'Orders',
    path: 'orders',
    icon: ShoppingCart,
    description: 'View and manage customer orders.',
    section: 'operations',
    featureKey: 'orders'
  },
  {
    id: 'customers',
    label: 'Customers',
    path: 'customers',
    icon: Users,
    description: 'Customer profiles, history, and communication.',
    section: 'operations',
    featureKey: 'customers'
  },
  {
    id: 'returns',
    label: 'Returns',
    path: 'returns',
    icon: RotateCcw,
    description: 'Manage return requests and refunds.',
    section: 'operations',
    featureKey: 'returns'
  },
  {
    id: 'payments',
    label: 'Payments',
    path: 'payments',
    icon: CreditCard,
    description: 'Order payment transactions.',
    section: 'operations',
    featureKey: 'payments'
  },
  {
    id: 'products',
    label: 'Products',
    path: 'products',
    icon: Package,
    description: 'Manage your product catalog, pricing, and inventory.',
    section: 'business',
    featureKey: 'products'
  },
  {
    id: 'categories',
    label: 'Categories',
    path: 'categories',
    icon: FolderTree,
    description: 'Product categories — required before adding products.',
    section: 'business'
  },
  {
    id: 'brands',
    label: 'Brands',
    path: 'brands',
    icon: Tag,
    description: 'Optional product brands.',
    section: 'business',
    featureKey: 'brands'
  },
  {
    id: 'product-tags',
    label: 'Product tags',
    path: 'product-tags',
    icon: Tags,
    description: 'Tags for products and storefront filters.',
    section: 'business'
  },
  {
    id: 'product-attributes',
    label: 'Features',
    path: 'product-attributes',
    icon: SlidersHorizontal,
    description: 'Variant features like Size and Color.',
    section: 'business'
  },
  {
    id: 'website',
    label: 'Website',
    path: 'website',
    icon: Globe,
    description: 'Edit your public store pages, content, theme, and publish settings.',
    section: 'business',
    featureKey: 'website_builder'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    path: 'reviews',
    icon: Star,
    description: 'Customer testimonials and product reviews.',
    section: 'business',
    featureKey: 'reviews'
  },
  {
    id: 'coupons',
    label: 'Coupons',
    path: 'coupons',
    icon: Ticket,
    description: 'Discount codes for checkout.',
    section: 'business',
    featureKey: 'coupons'
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    path: 'newsletter',
    icon: Mail,
    description: 'Newsletter subscribers.',
    section: 'business',
    featureKey: 'newsletter'
  },
  {
    id: 'settings',
    label: 'Store Settings',
    path: 'settings',
    icon: Settings,
    description: 'Shipping, payments, tax, and checkout rules.',
    section: 'settings',
    featureKey: 'advanced_settings'
  },
  {
    id: 'tax',
    label: 'Tax Rules',
    path: 'tax',
    icon: Percent,
    description: 'Tax rules by country/region.',
    section: 'settings',
    featureKey: 'tax_rules'
  }
];
