import { DashboardStats } from './dashboard-stats.model';

export interface DashboardCustomerSummary {
  id: string;
  name: string;
  initials: string;
  lastOrder: string;
  avatarColor: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'system' | 'order';
  read: boolean;
}

export interface RevenueSummary {
  total: number;
  currency: string;
  monthlyGrowth: number;
  sparkline: number[];
  ordersThisMonth: number;
  averageTicket: number;
  pendingPayouts: number;
}

export interface ProfileStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface TenantBranding {
  businessName: string;
  logoInitials: string;
  logoUrl?: string;
  tagline: string;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  dateLabel: string;
}

export interface DashboardData {
  revenue: RevenueSummary;
  recentOrders: RecentOrder[];
  recentCustomers: DashboardCustomerSummary[];
  notifications: DashboardNotification[];
  profileSteps: ProfileStep[];
  tenant: TenantBranding;
  stats: DashboardStats;
}
