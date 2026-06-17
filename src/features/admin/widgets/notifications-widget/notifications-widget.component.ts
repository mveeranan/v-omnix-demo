import { CommonModule, NgClass } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Bell, Calendar, CheckCheck } from 'lucide-angular';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-notifications-widget',
  standalone: true,
  imports: [CommonModule, NgClass, LucideAngularModule, DashboardWidgetShellComponent],
  templateUrl: './notifications-widget.component.html'
})
export class NotificationsWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly notifications = computed(() => this.dataService.dashboardData().notifications);
  readonly isEmpty = computed(
    () => !this.loading() && this.notifications().every((n) => n.read)
  );

  readonly bellIcon = Bell;
  readonly calendarIcon = Calendar;
  readonly markAllIcon = CheckCheck;

  markRead(id: string): void {
    this.dataService.markNotificationRead(id);
  }

  markAllRead(): void {
    this.dataService.markAllNotificationsRead();
  }
}
