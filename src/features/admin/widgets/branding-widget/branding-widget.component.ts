import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-branding-widget',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, DashboardWidgetShellComponent],
  templateUrl: './branding-widget.component.html',
  styleUrl: './branding-widget.component.scss'
})
export class BrandingWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly tenant = computed(() => this.dataService.dashboardData().tenant);
  readonly profileCompletionPercent = this.dataService.profileCompletionPercent;
  readonly pencilIcon = Pencil;
}
