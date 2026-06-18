import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { RevenueWidgetComponent } from '../widgets/revenue-widget/revenue-widget.component';
import { CustomersWidgetComponent } from '../widgets/customers-widget/customers-widget.component';
import { BrandingWidgetComponent } from '../widgets/branding-widget/branding-widget.component';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { OnboardingChecklistWidgetComponent } from '../widgets/onboarding-checklist-widget/onboarding-checklist-widget.component';
import { OnboardingService } from '../services/onboarding.service';
import { AdminDashboardDataService } from '../services/admin-dashboard-data.service';
import { widgetEnter, widgetsStagger } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RevenueWidgetComponent,
    CustomersWidgetComponent,
    BrandingWidgetComponent,
    OnboardingChecklistWidgetComponent,
    AdminPageShellComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  animations: [widgetEnter, widgetsStagger]
})
export class AdminDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly onboarding = inject(OnboardingService);
  private readonly dashboardData = inject(AdminDashboardDataService);

  readonly planLabel = computed(() => {
    const fromAuth = this.authService.getPlanName()?.trim();
    if (fromAuth) {
      return fromAuth;
    }
    const fromQuery = this.route.snapshot.queryParamMap.get('planId')?.trim();
    if (fromQuery) {
      return fromQuery;
    }
    const fromSession = sessionStorage.getItem('work-orbit.tenant.planName')?.trim();
    return fromSession || '—';
  });

  ngOnInit(): void {
    this.dashboardData.refreshFromStores();
    this.onboarding.refresh();
  }
}
