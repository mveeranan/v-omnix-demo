import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  User,
  Package,
  ShoppingCart,
  Globe
} from 'lucide-angular';

export type AdminNavSection = 'overview' | 'operations' | 'business' | 'settings';

export interface AdminNavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  description: string;
  section: AdminNavSection;
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
    section: 'overview'
  },
  {
    id: 'orders',
    label: 'Orders',
    path: 'orders',
    icon: ShoppingCart,
    description: 'View and manage customer orders.',
    section: 'operations'
  },
  {
    id: 'customers',
    label: 'Customers',
    path: 'customers',
    icon: Users,
    description: 'Customer profiles, history, and communication.',
    section: 'operations'
  },
  {
    id: 'products',
    label: 'Products',
    path: 'products',
    icon: Package,
    description: 'Manage your product catalog, pricing, and inventory.',
    section: 'business'
  },
  {
    id: 'website',
    label: 'Website',
    path: 'website',
    icon: Globe,
    description: 'Edit your public store pages, content, theme, and publish settings.',
    section: 'business'
  },
  {
    id: 'payments',
    label: 'Payments',
    path: 'payments',
    icon: CreditCard,
    description: 'Invoices, transactions, and payout overview.',
    section: 'settings'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: 'settings',
    icon: Settings,
    description: 'Workspace preferences, team, and integrations.',
    section: 'settings'
  }
];
