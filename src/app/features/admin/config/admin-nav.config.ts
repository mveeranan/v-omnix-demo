import {
  LayoutDashboard,
  Briefcase,
  Wrench,
  CalendarCheck,
  Calendar,
  Users,
  CreditCard,
  Settings,
  User
} from 'lucide-angular';

export interface AdminNavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  description: string;
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
