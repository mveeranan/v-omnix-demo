import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly planName = signal(this.authService.getPlanName() ?? '');

  readonly planNameSnapshot = this.planName.asReadonly();

  constructor() {
    this.syncPlanFromUrl(this.router.url);
    this.syncFromAuthStorage();
  }

  syncFromAuthStorage(): void {
    const planName = this.authService.getPlanName();
    if (planName) {
      this.planName.set(planName);
    }
  }

  syncPlanFromUrl(url: string): void {
    const tree = this.router.parseUrl(url);
    const queryPlan = tree.queryParams['planId'];
    if (queryPlan) {
      sessionStorage.setItem('work-orbit.tenant.planId', queryPlan);
    }
  }

  setPlanFromRegistration(planName: string): void {
    if (planName) {
      this.planName.set(planName);
    }
  }
}
