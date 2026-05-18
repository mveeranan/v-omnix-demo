import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-branding-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DashboardWidgetShellComponent],
  templateUrl: './branding-widget.component.html'
})
export class BrandingWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly tenant = computed(() => this.dataService.dashboardData().tenant);
  readonly pencilIcon = Pencil;
}
