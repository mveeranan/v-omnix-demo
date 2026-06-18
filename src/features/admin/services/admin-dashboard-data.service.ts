import { Injectable, computed, signal } from '@angular/core';
import { productCatalogStore } from '@features/store/data-access/product-catalog.store';
import { orderStore } from '../orders/data-access/order.store';
import { subscriptionStore } from '../data-access/subscription.store';
import { DashboardStats } from '../models/dashboard-stats.model';
import {
  DashboardData,
  RecentOrder,
  TenantBranding
} from '../models/dashboard-view.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardDataService {
  private readonly loading = signal(false);
  private readonly data = signal<DashboardData>(this.buildData());

  readonly isLoading = this.loading.asReadonly();
  readonly dashboardData = this.data.asReadonly();

  readonly unreadNotificationCount = computed(
    () => this.data().notifications.filter((n) => !n.read).length
  );

  readonly profileCompletionPercent = computed(() => {
    const steps = this.data().profileSteps;
    if (!steps.length) {
      return 0;
    }
    const completed = steps.filter((s) => s.completed).length;
    return Math.round((completed / steps.length) * 100);
  });

  refreshFromStores(): void {
    this.data.set(this.buildData());
    this.loading.set(false);
  }

  markNotificationRead(id: string): void {
    this.data.update((current) => ({
      ...current,
      notifications: current.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    }));
  }

  markAllNotificationsRead(): void {
    this.data.update((current) => ({
      ...current,
      notifications: current.notifications.map((n) => ({ ...n, read: true }))
    }));
  }

  markPortfolioUploaded(): void {
    this.data.update((current) => ({
      ...current,
      profileSteps: current.profileSteps.map((step) =>
        step.id === 's4' ? { ...step, completed: true } : step
      )
    }));
  }

  updateTenantBranding(tenant: Partial<TenantBranding>): void {
    this.data.update((current) => ({
      ...current,
      tenant: { ...current.tenant, ...tenant }
    }));
  }

  private buildData(): DashboardData {
    const orders = orderStore.getAll();
    const products = productCatalogStore.getAll();
    const sub = subscriptionStore.refreshFromSession();
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    const stats: DashboardStats = {
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: new Set(orders.map((o) => o.customerEmail)).size,
      totalProducts: products.length,
      pendingOrders,
      subscriptionStatus: sub.status,
      planName: sub.planType
    };

    const recentOrders: RecentOrder[] = orders.slice(0, 3).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customerName,
      total: o.total,
      currency: o.currency,
      status: o.status as RecentOrder['status'],
      dateLabel: 'Recent'
    }));

    return {
      revenue: {
        total: totalRevenue,
        currency: 'USD',
        monthlyGrowth: 12.4,
        sparkline: [32, 38, 35, 42, 48, 45, 52, 58, 55, 62, 68, totalRevenue || 72],
        ordersThisMonth: orders.length,
        averageTicket: orders.length ? totalRevenue / orders.length : 0,
        pendingPayouts: pendingOrders * 50
      },
      recentOrders,
      recentCustomers: [],
      notifications: [],
      profileSteps: [],
      tenant: {
        businessName: '',
        logoInitials: '',
        tagline: ''
      },
      stats
    };
  }
}
