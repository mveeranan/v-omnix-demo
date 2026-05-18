import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Eye } from 'lucide-angular';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-customers-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DashboardWidgetShellComponent],
  templateUrl: './customers-widget.component.html'
})
export class CustomersWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly customers = computed(() => this.dataService.dashboardData().recentCustomers);
  readonly isEmpty = computed(() => !this.loading() && this.customers().length === 0);
  readonly eyeIcon = Eye;
}
