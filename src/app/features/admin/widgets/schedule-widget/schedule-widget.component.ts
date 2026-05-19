import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import {
  AdminDashboardDataService,
  BookingStatus
} from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-schedule-widget',
  standalone: true,
  imports: [CommonModule, DashboardWidgetShellComponent],
  templateUrl: './schedule-widget.component.html',
  styleUrl: './schedule-widget.component.scss'
})
export class ScheduleWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly schedule = computed(() => this.dataService.dashboardData().todaySchedule);
  readonly isEmpty = computed(() => !this.loading() && this.schedule().length === 0);
  readonly scheduleDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  statusClass(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      confirmed:
        'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/35 dark:bg-blue-500/15 dark:text-blue-300',
      pending:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300',
      'in-progress':
        'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/35 dark:bg-indigo-500/15 dark:text-indigo-300',
      completed:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300',
      cancelled:
        'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
    };
    return map[status];
  }

  statusLabel(status: BookingStatus): string {
    return status.replace('-', ' ');
  }
}
