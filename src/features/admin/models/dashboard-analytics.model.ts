/**
 * Premium SaaS Dashboard Analytics Models
 * Real data-driven metrics for business intelligence
 */

export interface MetricPoint {
  date: string; // YYYY-MM-DD
  value: number;
  label?: string;
}

export interface MetricWithGrowth {
  current: number;
  previous: number;
  growth: number; // Percentage change
  growthDirection: 'up' | 'down' | 'neutral';
}

export interface RevenueMetrics extends MetricWithGrowth {
  currency: string;
  averageOrderValue: number;
  orderCount: number;
  pendingPayments: number;
}

export interface OrderMetrics extends MetricWithGrowth {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  byPaymentStatus: {
    paid: number;
    pending: number;
    failed: number;
    refunded: number;
  };
}

export interface CustomerMetrics extends MetricWithGrowth {
  totalCustomers: number;
  returningCustomers: number;
  returnRate: number; // Percentage
  firstTimeCustomers: number;
  averageLifetimeValue: number;
}

export interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  productsWithoutImages: number;
  productsWithoutDescription: number;
  lowStockProducts: number;
}

export interface TopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  currency: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  lowStockThreshold: number;
  sku?: string;
  severity: 'critical' | 'warning'; // critical < 5, warning < threshold
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  daysAgo: number;
}

export interface NewCustomerItem {
  id?: string;
  name: string;
  email: string;
  firstOrderDate: string;
  daysAgo: number;
  firstOrderTotal: number;
  currency: string;
}

export interface BusinessInsight {
  id: string;
  type: 'success' | 'info' | 'warning' | 'action';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PeriodComparison {
  label: string; // "Today", "This Week", "This Month"
  current: number;
  previous: number;
  growth: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: string;
}

export interface RevenueChart {
  period: '7d' | '30d' | '90d';
  data: ChartDataPoint[];
  total: number;
  average: number;
  min: number;
  max: number;
}

export interface OrderStatusChart {
  labels: string[];
  data: number[];
  colors?: string[];
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  percentage: number;
  value: number;
  currency: string;
}

export interface PremiumDashboardData {
  // Timestamp for cache invalidation
  generatedAt: string;

  // Top-level metrics
  revenue: RevenueMetrics;
  orders: OrderMetrics;
  customers: CustomerMetrics;
  products: ProductMetrics;

  // Comparison across periods
  revenueComparison: {
    today: PeriodComparison;
    week: PeriodComparison;
    month: PeriodComparison;
  };

  // Charts
  revenueChart: RevenueChart;
  orderStatusChart: OrderStatusChart;
  paymentMethodBreakdown: PaymentMethodBreakdown[];

  // Lists
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  recentOrders: RecentOrderItem[];
  newCustomers: NewCustomerItem[];

  // Business insights
  insights: BusinessInsight[];

  // Tenant/subscription info
  tenantName: string;
  planName: string;
  subscriptionRenewalDays?: number;
  websitePublished: boolean;
  profileCompletionPercent: number;
}
