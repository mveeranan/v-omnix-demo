import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { mapApiPlan, PlanApiDto, PricingPlan } from './pricing-plan.model';

interface CheckoutSessionResponse {
  checkoutUrl: string;
}

@Injectable({ providedIn: 'root' })
export class PlanCheckoutService {
  private readonly http = inject(HttpClient);

  async loadPlans(): Promise<PricingPlan[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<PlanApiDto[]>>(API_ENDPOINTS.plans.list)
    );

    if (!response.success || !Array.isArray(response.data)) {
      throw new Error(response.message || 'Unable to load pricing plans right now.');
    }

    return response.data.map((plan, index) => mapApiPlan(plan, index));
  }

  async initiateStripeCheckout(tenantId: string, planPriceId: string): Promise<string> {
    const checkoutResponse = await firstValueFrom(
      this.http.post<ApiResponse<CheckoutSessionResponse>>(API_ENDPOINTS.stripe.checkout, {
        planPriceId,
        tenantId
      })
    );

    if (!checkoutResponse.success || !checkoutResponse.data?.checkoutUrl) {
      throw new Error(
        checkoutResponse.message ||
          (Array.isArray(checkoutResponse.errors) && checkoutResponse.errors[0]) ||
          'Unable to create checkout session. Please try again.'
      );
    }

    return checkoutResponse.data.checkoutUrl;
  }
}
