import { Injectable, computed, signal } from '@angular/core';

export interface Customer {
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
  recentCustomers: Customer[];
  notifications: DashboardNotification[];
  profileSteps: ProfileStep[];
  tenant: TenantBranding;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardDataService {
  private readonly loading = signal(true);
  private readonly data = signal<DashboardData>(this.buildMockData());

  readonly isLoading = this.loading.asReadonly();
  readonly dashboardData = this.data.asReadonly();

  readonly unreadNotificationCount = computed(
    () => this.data().notifications.filter((n) => !n.read).length
  );

  readonly profileCompletionPercent = computed(() => {
    const steps = this.data().profileSteps;
    const completed = steps.filter((s) => s.completed).length;
    return Math.round((completed / steps.length) * 100);
  });

  constructor() {
    setTimeout(() => this.loading.set(false), 750);
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

  private buildMockData(): DashboardData {
    return {
      revenue: {
        total: 48250,
        currency: 'USD',
        monthlyGrowth: 12.4,
        sparkline: [32, 38, 35, 42, 48, 45, 52, 58, 55, 62, 68, 72],
        ordersThisMonth: 128,
        averageTicket: 377,
        pendingPayouts: 6240
      },
      recentOrders: [
        {
          id: 'o1',
          orderNumber: 'WO-482901',
          customer: 'Sarah Mitchell',
          total: 149.99,
          currency: 'USD',
          status: 'delivered',
          dateLabel: 'Today'
        },
        {
          id: 'o2',
          orderNumber: 'WO-482902',
          customer: 'James Chen',
          total: 89.0,
          currency: 'USD',
          status: 'shipped',
          dateLabel: 'Today'
        },
        {
          id: 'o3',
          orderNumber: 'WO-482903',
          customer: 'Emma Rodriguez',
          total: 245.5,
          currency: 'USD',
          status: 'confirmed',
          dateLabel: 'Yesterday'
        }
      ],
      recentCustomers: [
        {
          id: 'c1',
          name: 'Sarah Mitchell',
          initials: 'SM',
          lastOrder: '2 hours ago',
          avatarColor: 'bg-indigo-500'
        },
        {
          id: 'c2',
          name: 'James Chen',
          initials: 'JC',
          lastOrder: 'Today',
          avatarColor: 'bg-emerald-500'
        },
        {
          id: 'c3',
          name: 'Emma Rodriguez',
          initials: 'ER',
          lastOrder: 'Yesterday',
          avatarColor: 'bg-violet-500'
        }
      ],
      notifications: [
        {
          id: 'n1',
          title: 'New order',
          message: 'Order WO-482904 placed — $128.00',
          time: '5 min ago',
          type: 'order',
          read: false
        },
        {
          id: 'n2',
          title: 'Payment received',
          message: 'Invoice #1842 paid — $245.00',
          time: '1 hour ago',
          type: 'system',
          read: false
        },
        {
          id: 'n3',
          title: 'Order shipped',
          message: 'WO-482902 marked as shipped',
          time: '2 hours ago',
          type: 'order',
          read: false
        }
      ],
      profileSteps: [
        { id: 's1', label: 'Business profile', completed: false },
        { id: 's2', label: 'Products added', completed: true },
        { id: 's3', label: 'Payment setup', completed: false },
        { id: 's4', label: 'Website published', completed: false }
      ],
      tenant: {
        businessName: 'Acme Store Co.',
        logoInitials: 'AS',
        tagline: 'E-commerce made simple'
      }
    };
  }
}
