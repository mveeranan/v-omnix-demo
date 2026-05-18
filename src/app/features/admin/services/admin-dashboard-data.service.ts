import { Injectable, computed, signal } from '@angular/core';

export type BookingStatus = 'confirmed' | 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  time: string;
  customer: string;
  service: string;
  status: BookingStatus;
  dateLabel?: string;
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  lastBooking: string;
  avatarColor: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'system' | 'booking';
  read: boolean;
}

export interface RevenueSummary {
  total: number;
  currency: string;
  monthlyGrowth: number;
  sparkline: number[];
  bookingsThisMonth: number;
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

export interface DashboardData {
  revenue: RevenueSummary;
  todaySchedule: Booking[];
  upcomingBookings: Booking[];
  recentCustomers: Customer[];
  notifications: DashboardNotification[];
  profileSteps: ProfileStep[];
  tenant: TenantBranding;
}

@Injectable({
  providedIn: 'root'
})
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
      notifications: current.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    }));
  }

  markAllNotificationsRead(): void {
    this.data.update((current) => ({
      ...current,
      notifications: current.notifications.map((n) => ({ ...n, read: true }))
    }));
  }

  private buildMockData(): DashboardData {
    return {
      revenue: {
        total: 48250,
        currency: 'USD',
        monthlyGrowth: 12.4,
        sparkline: [32, 38, 35, 42, 48, 45, 52, 58, 55, 62, 68, 72],
        bookingsThisMonth: 128,
        averageTicket: 377,
        pendingPayouts: 6240
      },
      todaySchedule: [
        {
          id: '1',
          time: '09:00',
          customer: 'Sarah Mitchell',
          service: 'Consultation',
          status: 'completed'
        },
        {
          id: '2',
          time: '10:30',
          customer: 'James Chen',
          service: 'Premium Service',
          status: 'in-progress'
        },
        {
          id: '3',
          time: '13:00',
          customer: 'Emma Rodriguez',
          service: 'Standard Booking',
          status: 'confirmed'
        },
        {
          id: '4',
          time: '15:30',
          customer: 'Michael Park',
          service: 'Follow-up',
          status: 'pending'
        }
      ],
      upcomingBookings: [
        {
          id: '5',
          time: '16:00',
          customer: 'Lisa Thompson',
          service: 'Group Session',
          status: 'confirmed',
          dateLabel: 'Today'
        },
        {
          id: '6',
          time: '09:30',
          customer: 'David Wilson',
          service: 'Initial Assessment',
          status: 'confirmed',
          dateLabel: 'Tomorrow'
        },
        {
          id: '7',
          time: '11:00',
          customer: 'Anna Kowalski',
          service: 'Premium Package',
          status: 'pending',
          dateLabel: 'Tomorrow'
        },
        {
          id: '8',
          time: '14:00',
          customer: 'Robert Singh',
          service: 'Consultation',
          status: 'confirmed',
          dateLabel: 'Wed, May 20'
        },
        {
          id: '9',
          time: '10:00',
          customer: 'Jennifer Lee',
          service: 'Standard Service',
          status: 'confirmed',
          dateLabel: 'Wed, May 20'
        },
        {
          id: '10',
          time: '15:00',
          customer: 'Chris Martinez',
          service: 'Express Booking',
          status: 'pending',
          dateLabel: 'Thu, May 21'
        },
        {
          id: '11',
          time: '11:30',
          customer: 'Patricia Brown',
          service: 'Follow-up',
          status: 'confirmed',
          dateLabel: 'Thu, May 21'
        },
        {
          id: '12',
          time: '16:30',
          customer: 'Thomas Anderson',
          service: 'Premium Service',
          status: 'confirmed',
          dateLabel: 'Fri, May 22'
        }
      ],
      recentCustomers: [
        {
          id: 'c1',
          name: 'Sarah Mitchell',
          initials: 'SM',
          lastBooking: '2 hours ago',
          avatarColor: 'bg-indigo-500'
        },
        {
          id: 'c2',
          name: 'James Chen',
          initials: 'JC',
          lastBooking: 'Today',
          avatarColor: 'bg-emerald-500'
        },
        {
          id: 'c3',
          name: 'Emma Rodriguez',
          initials: 'ER',
          lastBooking: 'Yesterday',
          avatarColor: 'bg-violet-500'
        },
        {
          id: 'c4',
          name: 'Michael Park',
          initials: 'MP',
          lastBooking: '2 days ago',
          avatarColor: 'bg-amber-500'
        },
        {
          id: 'c5',
          name: 'Lisa Thompson',
          initials: 'LT',
          lastBooking: '3 days ago',
          avatarColor: 'bg-rose-500'
        }
      ],
      notifications: [
        {
          id: 'n1',
          title: 'New booking request',
          message: 'Michael Park requested a follow-up for 3:30 PM',
          time: '5 min ago',
          type: 'booking',
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
          title: 'Booking confirmed',
          message: 'Emma Rodriguez confirmed for 1:00 PM today',
          time: '2 hours ago',
          type: 'booking',
          read: false
        },
        {
          id: 'n4',
          title: 'System update',
          message: 'Scheduled maintenance completed successfully',
          time: 'Yesterday',
          type: 'system',
          read: true
        }
      ],
      profileSteps: [
        { id: 's1', label: 'Business profile', completed: true },
        { id: 's2', label: 'Services added', completed: true },
        { id: 's3', label: 'Availability set', completed: false },
        { id: 's4', label: 'Portfolio uploaded', completed: false }
      ],
      tenant: {
        businessName: 'Acme Services Co.',
        logoInitials: 'AS',
        tagline: 'Universal booking platform'
      }
    };
  }
}
