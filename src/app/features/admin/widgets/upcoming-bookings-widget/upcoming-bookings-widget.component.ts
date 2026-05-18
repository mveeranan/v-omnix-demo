import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-upcoming-bookings-widget',
  standalone: true,
  imports: [CommonModule, DashboardWidgetShellComponent],
  templateUrl: './upcoming-bookings-widget.component.html'
})
export class UpcomingBookingsWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly bookings = computed(() => this.dataService.dashboardData().upcomingBookings);
  readonly isEmpty = computed(() => !this.loading() && this.bookings().length === 0);
}
