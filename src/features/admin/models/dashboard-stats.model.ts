import { SubscriptionStatus } from '@shared/models/backend-enums';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  subscriptionStatus: SubscriptionStatus;
  planName: string;
}
