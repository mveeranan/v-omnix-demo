import {
  LayoutDashboard,
  Briefcase,
  Wrench,
  CalendarCheck,
  Calendar,
  Users,
  CreditCard,
  Settings,
  User,
  MapPin
} from 'lucide-angular';

export type AdminNavSection = 'overview' | 'operations' | 'business' | 'settings';

export interface AdminNavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  description: string;
  section: AdminNavSection;
  requiresCapability?: 'manageBranches';
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
    description: 'Your business at a glance — bookings, revenue, and activity.',
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
    id: 'bookings',
    label: 'Bookings',
    path: 'bookings',
    icon: CalendarCheck,
    description: 'View and manage all customer bookings.',
    section: 'operations'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    path: 'calendar',
    icon: Calendar,
    description: 'Schedule availability and team calendars.',
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
    id: 'services',
    label: 'Services',
    path: 'services',
    icon: Wrench,
    description: 'Manage service offerings, pricing, and durations.',
    section: 'business'
  },
  {
    id: 'branches',
    label: 'Branches',
    path: 'branches',
    icon: MapPin,
    description: 'Manage locations, hours, and primary branch settings.',
    requiresCapability: 'manageBranches',
    section: 'business'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    path: 'portfolio',
    icon: Briefcase,
    description: 'Showcase your work, galleries, and brand presence.',
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
