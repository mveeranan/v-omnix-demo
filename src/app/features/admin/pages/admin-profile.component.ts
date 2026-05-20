import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Check, Circle, ArrowRight } from 'lucide-angular';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AdminDashboardDataService } from '../services/admin-dashboard-data.service';
import { pageFadeIn } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, AdminPageShellComponent],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
  animations: [pageFadeIn]
})
export class AdminProfileComponent {
  private readonly dataService = inject(AdminDashboardDataService);

  readonly loading = this.dataService.isLoading;
  readonly tenant = computed(() => this.dataService.dashboardData().tenant);
  readonly steps = computed(() => this.dataService.dashboardData().profileSteps);
  readonly percent = this.dataService.profileCompletionPercent;
  readonly completedCount = computed(() => this.steps().filter((s) => s.completed).length);
  readonly checkIcon = Check;
  readonly circleIcon = Circle;
  readonly arrowIcon = ArrowRight;

  readonly circumference = 2 * Math.PI * 54;

  readonly strokeDashoffset = computed(
    () => this.circumference - (this.percent() / 100) * this.circumference
  );

  stepRoute(stepId: string): string {
    const routes: Record<string, string> = {
      s1: '/admin/settings',
      s2: '/admin/services',
      s3: '/admin/calendar',
      s4: '/admin/portfolio'
    };
    return routes[stepId] ?? '/admin/dashboard';
  }
}
