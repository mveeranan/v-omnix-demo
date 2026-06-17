import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Check, Circle } from 'lucide-angular';
import { DashboardWidgetShellComponent } from '../dashboard-widget-shell.component';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';

@Component({
  selector: 'app-completion-widget',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DashboardWidgetShellComponent],
  templateUrl: './completion-widget.component.html'
})
export class CompletionWidgetComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly steps = computed(() => this.dataService.dashboardData().profileSteps);
  readonly percent = this.dataService.profileCompletionPercent;
  readonly checkIcon = Check;
  readonly circleIcon = Circle;

  readonly circumference = 2 * Math.PI * 42;
  readonly strokeDashoffset = computed(
    () => this.circumference - (this.percent() / 100) * this.circumference
  );
}
