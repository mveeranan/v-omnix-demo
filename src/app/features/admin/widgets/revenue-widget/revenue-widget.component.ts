import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import {
  AdminDashboardDataService,
  RevenueSummary
} from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-revenue-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DashboardWidgetShellComponent],
  templateUrl: './revenue-widget.component.html',
  styleUrl: './revenue-widget.component.scss'
})
export class RevenueWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly revenue = computed(() => this.dataService.dashboardData().revenue);
  readonly trendUpIcon = TrendingUp;
  readonly trendDownIcon = TrendingDown;

  formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(value);
  }

  sparklinePath(data: RevenueSummary['sparkline']): string {
    const width = 400;
    const height = 56;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }
}
