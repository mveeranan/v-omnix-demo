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

export interface AdminNavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  description: string;
  /** When set, item is shown only if the matching capability is enabled. */
  requiresCapability?: 'manageBranches';
}

export const ADMIN_NAV_ITEMS: AdminNavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: 'dashboard',
    icon: LayoutDashboard,
    description: 'Your business at a glance — bookings, revenue, and activity.'
  },
  {
    id: 'profile',
    label: 'Profile',
    path: 'profile',
    icon: User,
    description: 'Complete your workspace setup and manage profile details.'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    path: 'portfolio',
    icon: Briefcase,
    description: 'Showcase your work, galleries, and brand presence.'
  },
  {
    id: 'services',
    label: 'Services',
    path: 'services',
    icon: Wrench,
    description: 'Manage service offerings, pricing, and durations.'
  },
  {
    id: 'branches',
    label: 'Branches',
    path: 'branches',
    icon: MapPin,
    description: 'Manage locations, hours, and primary branch settings.',
    requiresCapability: 'manageBranches'
  },
  {
    id: 'bookings',
    label: 'Bookings',
    path: 'bookings',
    icon: CalendarCheck,
    description: 'View and manage all customer bookings.'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    path: 'calendar',
    icon: Calendar,
    description: 'Schedule availability and team calendars.'
  },
  {
    id: 'customers',
    label: 'Customers',
    path: 'customers',
    icon: Users,
    description: 'Customer profiles, history, and communication.'
  },
  {
    id: 'payments',
    label: 'Payments',
    path: 'payments',
    icon: CreditCard,
    description: 'Invoices, transactions, and payout overview.'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: 'settings',
    icon: Settings,
    description: 'Workspace preferences, team, and integrations.'
  }
];
