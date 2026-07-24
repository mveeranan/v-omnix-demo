import { Injectable, inject, computed, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Order, OrderStatus, PaymentStatus } from '../orders/models/order.model';
import { OrderService } from '../orders/data-access/order.service';
import { ProductAdminService } from '../products/data-access/product-admin.service';
import {
  PremiumDashboardData,
  RevenueMetrics,
  OrderMetrics,
  CustomerMetrics,
  ProductMetrics,
  PeriodComparison,
  RevenueChart,
  OrderStatusChart,
  PaymentMethodBreakdown,
  TopProduct,
  LowStockProduct,
  RecentOrderItem,
  NewCustomerItem,
  BusinessInsight,
  ChartDataPoint,
  MetricWithGrowth
} from '../models/dashboard-analytics.model';
import { NotificationService } from '@core/notifications/notification.service';
import { subscriptionStore } from '../data-access/subscription.store';

@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsService {
  private readonly orderApi = inject(OrderService);
  private readonly productApi = inject(ProductAdminService);
  private readonly notifications = inject(NotificationService);

  private readonly dashboardData = signal<PremiumDashboardData | null>(null);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  // Public readonly signals
  readonly data = this.dashboardData.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly hasError = this.error.asReadonly();

  /**
   * Load complete dashboard analytics data
   * Fetches orders and products, then aggregates into comprehensive metrics
   */
  loadDashboardData(): Observable<PremiumDashboardData> {
    this.loading.set(true);
    this.error.set(null);

    return forkJoin({
      orders: this.fetchOrdersForAnalytics(),
      products: this.fetchProductsForAnalytics(),
      subscription: of(subscriptionStore.refreshFromSession())
    }).pipe(
      map(({ orders, products, subscription }) =>
        this.buildDashboardData(orders, products, subscription)
      ),
      tap((data) => this.dashboardData.set(data)),
      tap(() => this.loading.set(false)),
      catchError((err) => {
        const message = 'Failed to load dashboard analytics';
        this.notifications.errorFromApi(err, message);
        this.error.set(message);
        this.loading.set(false);
        throw err;
      })
    );
  }

  /**
   * Fetch all orders (no pagination for analytics aggregation)
   */
  private fetchOrdersForAnalytics(): Observable<Order[]> {
    return this.orderApi.list({ pageSize: 1000 }).pipe(
      map((result) => result.items),
      catchError(() => of([]))
    );
  }

  /**
   * Fetch all products
   */
  private fetchProductsForAnalytics(): Observable<any[]> {
    return this.productApi.list({ pageSize: 1000 }).pipe(
      map((result) => result.items),
      catchError(() => of([]))
    );
  }

  /**
   * Build comprehensive dashboard data from raw order and product data
   */
  private buildDashboardData(orders: Order[], products: any[], subscription: any): PremiumDashboardData {
    const now = new Date();
    const today = this.getDateAtMidnight(now);
    const yesterday = this.addDays(today, -1);
    const weekAgo = this.addDays(today, -7);
    const monthAgo = this.addDays(today, -30);

    // Filter orders by period
    const todayOrders = orders.filter((o) => this.getDateAtMidnight(new Date(o.createdAt)) >= today);
    const yesterdayOrders = orders.filter(
      (o) =>
        this.getDateAtMidnight(new Date(o.createdAt)) >= yesterday &&
        this.getDateAtMidnight(new Date(o.createdAt)) < today
    );
    const weekOrders = orders.filter((o) => new Date(o.createdAt) >= weekAgo);
    const monthOrders = orders.filter((o) => new Date(o.createdAt) >= monthAgo);

    return {
      generatedAt: now.toISOString(),
      revenue: this.calculateRevenueMetrics(todayOrders, yesterdayOrders, monthOrders),
      orders: this.calculateOrderMetrics(todayOrders, yesterdayOrders, orders),
      customers: this.calculateCustomerMetrics(orders, monthOrders),
      products: this.calculateProductMetrics(products),
      revenueComparison: {
        today: this.calculatePeriodComparison('Today', todayOrders, yesterdayOrders),
        week: this.calculatePeriodComparison('This Week', weekOrders, orders),
        month: this.calculatePeriodComparison('This Month', monthOrders, orders)
      },
      revenueChart: this.buildRevenueChart(orders, '30d'),
      orderStatusChart: this.buildOrderStatusChart(orders),
      paymentMethodBreakdown: this.buildPaymentMethodBreakdown(orders),
      topProducts: this.getTopProducts(orders, 5),
      lowStockProducts: this.getLowStockProducts(products),
      recentOrders: this.getRecentOrders(orders, 5),
      newCustomers: this.getNewCustomers(orders, 5),
      insights: this.generateBusinessInsights(orders, products, monthOrders),
      tenantName: '', // Will be populated from tenant context
      planName: subscription?.planType || 'Free',
      subscriptionRenewalDays: this.getSubscriptionRenewalDays(subscription),
      websitePublished: false, // Will be populated from website service
      profileCompletionPercent: 0 // Will be populated from profile service
    };
  }

  /**
   * Calculate revenue metrics with growth comparison
   */
  private calculateRevenueMetrics(
    todayOrders: Order[],
    yesterdayOrders: Order[],
    monthOrders: Order[]
  ): RevenueMetrics {
    // Only count paid/confirmed orders for revenue
    const paidStatuses: PaymentStatus[] = ['paid'];
    const todayRevenue = this.sumOrdersRevenue(todayOrders, paidStatuses);
    const yesterdayRevenue = this.sumOrdersRevenue(yesterdayOrders, paidStatuses);
    const monthRevenue = this.sumOrdersRevenue(monthOrders, paidStatuses);
    const previousMonthRevenue = monthRevenue * 0.88; // Estimated from current month

    return {
      current: todayRevenue,
      previous: yesterdayRevenue,
      growth: this.calculateGrowthPercent(todayRevenue, yesterdayRevenue),
      growthDirection: this.getGrowthDirection(todayRevenue, yesterdayRevenue),
      currency: 'USD',
      averageOrderValue:
        todayOrders.length > 0
          ? todayOrders.reduce((sum, o) => sum + o.total, 0) / todayOrders.length
          : 0,
      orderCount: todayOrders.length,
      pendingPayments: this.sumOrdersRevenue(
        todayOrders.filter((o) => o.paymentStatus === 'pending'),
        []
      )
    };
  }

  /**
   * Calculate order metrics
   */
  private calculateOrderMetrics(todayOrders: Order[], yesterdayOrders: Order[], allOrders: Order[]): OrderMetrics {
    const todayCount = todayOrders.length;
    const yesterdayCount = yesterdayOrders.length;

    return {
      current: todayCount,
      previous: yesterdayCount,
      growth: this.calculateGrowthPercent(todayCount, yesterdayCount),
      growthDirection: this.getGrowthDirection(todayCount, yesterdayCount),
      pending: allOrders.filter((o) => o.status === 'pending').length,
      confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipped: allOrders.filter((o) => o.status === 'shipped').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
      byPaymentStatus: {
        paid: allOrders.filter((o) => o.paymentStatus === 'paid').length,
        pending: allOrders.filter((o) => o.paymentStatus === 'pending').length,
        failed: allOrders.filter((o) => o.paymentStatus === 'failed').length,
        refunded: allOrders.filter((o) => o.paymentStatus === 'refunded').length
      }
    };
  }

  /**
   * Calculate customer metrics
   */
  private calculateCustomerMetrics(allOrders: Order[], monthOrders: Order[]): CustomerMetrics {
    const uniqueEmails = new Set(allOrders.map((o) => o.customerEmail));
    const totalCustomers = uniqueEmails.size;

    const monthEmails = new Set(monthOrders.map((o) => o.customerEmail));
    const newThisMonth = monthEmails.size;

    // Calculate returning customers (appeared in 2+ orders)
    const emailCounts = new Map<string, number>();
    allOrders.forEach((o) => {
      emailCounts.set(o.customerEmail, (emailCounts.get(o.customerEmail) || 0) + 1);
    });
    const returningCustomers = Array.from(emailCounts.values()).filter((count) => count >= 2).length;

    // Calculate average lifetime value
    const customerValues = new Map<string, number>();
    allOrders.forEach((o) => {
      customerValues.set(o.customerEmail, (customerValues.get(o.customerEmail) || 0) + o.total);
    });
    const avgLifetimeValue =
      customerValues.size > 0
        ? Array.from(customerValues.values()).reduce((a, b) => a + b, 0) / customerValues.size
        : 0;

    return {
      current: newThisMonth,
      previous: Math.max(0, totalCustomers - newThisMonth),
      growth: totalCustomers > 0 ? (newThisMonth / totalCustomers) * 100 : 0,
      growthDirection: newThisMonth > 0 ? 'up' : 'neutral',
      totalCustomers,
      returningCustomers,
      returnRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
      firstTimeCustomers: totalCustomers - returningCustomers,
      averageLifetimeValue: avgLifetimeValue
    };
  }

  /**
   * Calculate product metrics
   */
  private calculateProductMetrics(products: any[]): ProductMetrics {
    return {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === 'Published').length,
      draftProducts: products.filter((p) => p.status === 'Draft').length,
      productsWithoutImages: products.filter((p) => !p.primaryImageUrl).length,
      productsWithoutDescription: products.filter((p) => !p.description).length,
      lowStockProducts: 0 // Would need inventory data
    };
  }

  /**
   * Calculate period comparison
   */
  private calculatePeriodComparison(label: string, currentOrders: Order[], previousOrders: Order[]): PeriodComparison {
    const current = this.sumOrdersRevenue(currentOrders, ['paid']);
    const previous = this.sumOrdersRevenue(previousOrders, ['paid']);

    return {
      label,
      current,
      previous,
      growth: this.calculateGrowthPercent(current, previous)
    };
  }

  /**
   * Build revenue trend chart
   */
  private buildRevenueChart(orders: Order[], period: '7d' | '30d' | '90d'): RevenueChart {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data: ChartDataPoint[] = [];

    // Group orders by date
    const dailyRevenue = new Map<string, number>();
    orders.forEach((o) => {
      const date = this.getDateString(new Date(o.createdAt));
      dailyRevenue.set(date, (dailyRevenue.get(date) || 0) + o.total);
    });

    // Generate data points for last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = this.addDays(new Date(), -i);
      const dateStr = this.getDateString(date);
      const value = dailyRevenue.get(dateStr) || 0;
      data.push({
        label: this.formatDateShort(date),
        value,
        timestamp: dateStr
      });
    }

    const values = data.map((d) => d.value);
    const total = values.reduce((a, b) => a + b, 0);

    return {
      period,
      data,
      total,
      average: total / data.length,
      min: Math.min(...values, 0),
      max: Math.max(...values, 1)
    };
  }

  /**
   * Build order status distribution chart
   */
  private buildOrderStatusChart(orders: Order[]): OrderStatusChart {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[];
    const data = statuses.map((status) => orders.filter((o) => o.status === status).length);

    return {
      labels: statuses.map((s) => this.formatStatus(s)),
      data,
      colors: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#6c63ff', '#a6a6a6']
    };
  }

  /**
   * Build payment method breakdown
   */
  private buildPaymentMethodBreakdown(orders: Order[]): PaymentMethodBreakdown[] {
    const breakdown = new Map<string, { count: number; value: number }>();

    orders.forEach((o) => {
      const method = this.formatPaymentMethod(o.paymentMethod);
      const current = breakdown.get(method) || { count: 0, value: 0 };
      breakdown.set(method, { count: current.count + 1, value: current.value + o.total });
    });

    const total = orders.length;
    const totalValue = orders.reduce((sum, o) => sum + o.total, 0);

    return Array.from(breakdown.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      percentage: (data.count / total) * 100,
      value: data.value,
      currency: 'USD'
    }));
  }

  /**
   * Get top selling products
   */
  private getTopProducts(orders: Order[], limit: number): TopProduct[] {
    const productSales = new Map<string, { name: string; units: number; revenue: number }>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.productId;
        const current = productSales.get(key) || { name: item.productName, units: 0, revenue: 0 };
        productSales.set(key, {
          name: current.name,
          units: current.units + item.quantity,
          revenue: current.revenue + item.lineTotal
        });
      });
    });

    return Array.from(productSales.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        unitsSold: data.units,
        revenue: data.revenue,
        currency: 'USD',
        trend: 'up' as const,
        trendValue: 0
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);
  }

  /**
   * Get low stock products
   */
  private getLowStockProducts(products: any[]): LowStockProduct[] {
    // This would require inventory data from backend
    return [];
  }

  /**
   * Get recent orders
   */
  private getRecentOrders(orders: Order[], limit: number): RecentOrderItem[] {
    const now = new Date();

    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        daysAgo: Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      }));
  }

  /**
   * Get new customers
   */
  private getNewCustomers(orders: Order[], limit: number): NewCustomerItem[] {
    // Get first order per customer
    const customerFirstOrder = new Map<string, Order>();
    orders.forEach((order) => {
      if (!customerFirstOrder.has(order.customerEmail)) {
        customerFirstOrder.set(order.customerEmail, order);
      } else if (new Date(order.createdAt) < new Date(customerFirstOrder.get(order.customerEmail)!.createdAt)) {
        customerFirstOrder.set(order.customerEmail, order);
      }
    });

    const now = new Date();

    return Array.from(customerFirstOrder.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map((order) => ({
        name: order.customerName,
        email: order.customerEmail,
        firstOrderDate: order.createdAt,
        daysAgo: Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        firstOrderTotal: order.total,
        currency: order.currency
      }));
  }

  /**
   * Generate business insights and recommendations
   */
  private generateBusinessInsights(orders: Order[], products: any[], monthOrders: Order[]): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    // Low revenue insight
    const monthRevenue = this.sumOrdersRevenue(monthOrders, ['paid']);
    if (monthRevenue < 500) {
      insights.push({
        id: 'low-revenue',
        type: 'action',
        title: 'Boost Your Sales',
        message: `Your revenue this month is $${monthRevenue.toFixed(0)}. Consider adding more products or running a promotion.`,
        priority: 'high'
      });
    }

    // Products without images
    const missingImages = products.filter((p) => !p.primaryImageUrl).length;
    if (missingImages > 0) {
      insights.push({
        id: 'missing-images',
        type: 'warning',
        title: 'Products Need Images',
        message: `${missingImages} product(s) don't have images. Add them to improve sales.`,
        actionLabel: 'Add Images',
        priority: 'medium'
      });
    }

    // Few products insight
    if (products.length < 5) {
      insights.push({
        id: 'few-products',
        type: 'action',
        title: 'Expand Your Catalog',
        message: `You have ${products.length} product(s). Adding more variety can increase sales.`,
        actionLabel: 'Add Product',
        priority: 'medium'
      });
    }

    // No orders yet
    if (orders.length === 0) {
      insights.push({
        id: 'no-orders',
        type: 'info',
        title: 'Launch Your Store',
        message: 'You haven\'t received any orders yet. Make sure your website is published and share the link.',
        priority: 'high'
      });
    }

    return insights.slice(0, 5);
  }

  // =====================
  // Helper Methods
  // =====================

  private sumOrdersRevenue(orders: Order[], paymentStatuses: PaymentStatus[]): number {
    return orders
      .filter((o) => paymentStatuses.length === 0 || paymentStatuses.includes(o.paymentStatus))
      .reduce((sum, o) => sum + o.total, 0);
  }

  private calculateGrowthPercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private getGrowthDirection(current: number, previous: number): 'up' | 'down' | 'neutral' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  }

  private getDateAtMidnight(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateShort(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  }

  private formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  private formatPaymentMethod(method: string): string {
    const map: Record<string, string> = {
      card: 'Credit Card',
      upi: 'UPI',
      razorpay: 'Razorpay',
      cod: 'Cash on Delivery',
      wallet: 'Digital Wallet',
      paypal: 'PayPal'
    };
    return map[method] || method;
  }

  private getSubscriptionRenewalDays(subscription: any): number | undefined {
    // Parse subscription renewal date if available
    return undefined;
  }
}
