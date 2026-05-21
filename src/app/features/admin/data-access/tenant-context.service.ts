import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';

const PLAN_NAME_KEY = 'work-orbit.tenant.planName';
const PLAN_ID_KEY = 'work-orbit.tenant.planId';

export interface TenantSummaryDto {
  tenantId?: string;
  planId?: string;
  planName?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly planName = signal(this.readStoredPlanName());
  private readonly planId = signal(this.readStoredPlanId());

  readonly planNameSnapshot = this.planName.asReadonly();
  readonly planIdSnapshot = this.planId.asReadonly();

  readonly showBranchOnProfile = computed(() => {
    const name = (this.planName() ?? '').toLowerCase();
    if (!name) return true;
    if (name.includes('master') || name.includes('gold') || name.includes('enterprise')) {
      return false;
    }
    return name.includes('starter') || name.includes('studio') || name.includes('silver');
  });

  constructor() {
    this.syncPlanFromUrl(this.router.url);
    this.loadTenantContext();
  }

  syncPlanFromUrl(url: string): void {
    const tree = this.router.parseUrl(url);
    const queryPlan = tree.queryParams['planId'];
    if (queryPlan) {
      this.planId.set(queryPlan);
      sessionStorage.setItem(PLAN_ID_KEY, queryPlan);
    }
  }

  setPlanFromRegistration(planName: string, planId?: string): void {
    if (planName) {
      this.planName.set(planName);
      sessionStorage.setItem(PLAN_NAME_KEY, planName);
    }
    if (planId) {
      this.planId.set(planId);
      sessionStorage.setItem(PLAN_ID_KEY, planId);
    }
  }

  private loadTenantContext(): void {
    this.http.get<ApiResponse<TenantSummaryDto>>(API_ENDPOINTS.tenant.current).subscribe({
      next: (response) => {
        if (!response.success || !response.data) return;
        if (response.data.planName) {
          this.planName.set(response.data.planName);
          sessionStorage.setItem(PLAN_NAME_KEY, response.data.planName);
        }
        if (response.data.planId) {
          this.planId.set(response.data.planId);
          sessionStorage.setItem(PLAN_ID_KEY, response.data.planId);
        }
      },
      error: () => {
        /* interim: sessionStorage + query param until tenant API is live */
      }
    });
  }

  private readStoredPlanName(): string {
    return sessionStorage.getItem(PLAN_NAME_KEY) ?? '';
  }

  private readStoredPlanId(): string {
    return sessionStorage.getItem(PLAN_ID_KEY) ?? '';
  }
}
