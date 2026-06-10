import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly planName = signal(this.authService.getPlanName() ?? '');
  private readonly multiBranch = signal(this.authService.getMultiBranch());

  readonly planNameSnapshot = this.planName.asReadonly();

  /** Master multi-branch tenants: `multiBranch` + `ADMIN` role (from login context). */
  readonly canManageBranches = computed(() => {
    if (this.multiBranch() !== true) {
      return false;
    }
    const role = (this.authService.getRoleName() ?? '').trim().toUpperCase();
    return role === 'ADMIN';
  });

  /** Master / multi-branch tenants must pick a branch before services in booking flows. */
  readonly isMultiBranchTenant = computed(() => {
    const multiBranch = this.multiBranch();
    if (multiBranch === true) {
      return true;
    }
    if (multiBranch === false) {
      return false;
    }
    const name = (this.planName() ?? '').toLowerCase();
    if (!name) {
      return false;
    }
    return (
      name.includes('master') || name.includes('gold') || name.includes('enterprise')
    );
  });

  readonly showBranchOnProfile = computed(() => {
    const multiBranch = this.multiBranch();
    if (multiBranch === false) {
      return true;
    }
    if (multiBranch === true) {
      return false;
    }

    const name = (this.planName() ?? '').toLowerCase();
    if (!name) {
      return true;
    }
    if (name.includes('master') || name.includes('gold') || name.includes('enterprise')) {
      return false;
    }
    return name.includes('starter') || name.includes('studio') || name.includes('silver');
  });

  constructor() {
    this.syncPlanFromUrl(this.router.url);
    this.syncFromAuthStorage();
  }

  syncFromAuthStorage(): void {
    const planName = this.authService.getPlanName();
    if (planName) {
      this.planName.set(planName);
    }
    const multiBranch = this.authService.getMultiBranch();
    if (multiBranch !== null) {
      this.multiBranch.set(multiBranch);
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
