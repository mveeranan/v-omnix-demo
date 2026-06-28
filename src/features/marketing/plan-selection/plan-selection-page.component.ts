import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Check, LucideAngularModule, Sparkles } from 'lucide-angular';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { getApiErrorMessage } from '@shared/utils/api-error.util';
import { formatPhoneWithDialCode } from '@shared/utils/phone.util';
import { PlanCheckoutService } from './plan-checkout.service';
import { PlanSelectionFlowService } from './plan-selection-flow.service';
import {
  PlanSelectionFlow,
  PricingPlan,
  getDisplayCurrency,
  getDisplayPrice,
  getPlanPrice
} from './pricing-plan.model';

interface RegisterData {
  tenantId: string;
  lastPlanId?: string | null;
}

@Component({
  selector: 'app-plan-selection-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './plan-selection-page.component.html',
  styleUrl: './plan-selection-page.component.scss'
})
export class PlanSelectionPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly planCheckout = inject(PlanCheckoutService);
  private readonly flowService = inject(PlanSelectionFlowService);

  readonly checkIcon = Check;
  readonly sparklesIcon = Sparkles;

  flow: PlanSelectionFlow = 'register';
  returnUrl = '/admin/dashboard';
  annual = false;
  pricingPlans: PricingPlan[] = [];
  pricingLoading = true;
  pricingError = '';
  pageError = '';
  submitting = false;
  selectedPlanId = '';
  previousPlanId = '';

  get pageTitle(): string {
    return this.flow === 'renew' ? 'Choose your subscription plan' : 'Choose your plan';
  }

  get pageSubtitle(): string {
    if (this.flow === 'renew') {
      return 'Your subscription needs attention. Select a plan to continue to secure payment.';
    }
    return 'Select a plan before creating your account. You will continue to secure payment after signup.';
  }

  get backLabel(): string {
    return this.flow === 'renew' ? 'Back to home' : 'Back to registration';
  }

  get continueLoadingLabel(): string {
    return this.flow === 'renew' ? 'Redirecting to payment...' : 'Creating account...';
  }

  get selectedPlanLabel(): string {
    return this.pricingPlans.find((plan) => plan.id === this.selectedPlanId)?.name ?? '';
  }

  get previousPlanName(): string {
    return this.pricingPlans.find((plan) => plan.id === this.previousPlanId)?.name ?? '';
  }

  get showPreviousPlanCallout(): boolean {
    return this.flow === 'renew' && Boolean(this.previousPlanId);
  }

  ngOnInit(): void {
    const flowParam = this.route.snapshot.queryParamMap.get('flow');
    this.flow = flowParam === 'renew' ? 'renew' : 'register';
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl')?.trim() || '/admin/dashboard';

    if (this.flow === 'renew') {
      if (!this.authService.isLoggedIn()) {
        void this.router.navigate(['/home'], {
          queryParams: { returnUrl: `/select-plan?flow=renew&returnUrl=${encodeURIComponent(this.returnUrl)}` }
        });
        return;
      }
      this.previousPlanId = this.authService.getLastPlanId()?.trim() ?? '';
      this.selectedPlanId = this.previousPlanId;
    } else if (!this.flowService.hasPendingRegistration()) {
      void this.router.navigate(['/home']);
      return;
    }

    void this.loadPlans();
  }

  setAnnual(annual: boolean): void {
    this.annual = annual;
  }

  selectPlan(planId: string): void {
    this.selectedPlanId = planId;
    this.pageError = '';
  }

  getDisplayPrice(plan: PricingPlan): string {
    return getDisplayPrice(plan, this.annual);
  }

  getDisplayCurrency(plan: PricingPlan): string {
    return getDisplayCurrency(plan, this.annual);
  }

  goBack(): void {
    if (this.flow === 'renew') {
      void this.router.navigate(['/home']);
      return;
    }
    void this.router.navigate(['/home'], { queryParams: { register: '1' } });
  }

  async continueWithPlan(): Promise<void> {
    if (this.submitting) {
      return;
    }

    const plan = this.pricingPlans.find((item) => item.id === this.selectedPlanId);
    if (!plan) {
      this.pageError = 'Please select a plan to continue.';
      return;
    }

    const selectedPrice = getPlanPrice(plan, this.annual);
    const planPriceId = selectedPrice?.planPriceId?.trim();
    if (!planPriceId) {
      this.pageError = 'Selected plan has no price for the current billing cycle.';
      return;
    }

    this.pageError = '';
    this.submitting = true;

    try {
      if (this.flow === 'renew') {
        await this.continueRenewal(planPriceId);
        return;
      }
      await this.continueRegistration(plan, planPriceId);
    } catch (error) {
      this.submitting = false;
      this.pageError = getApiErrorMessage(error, 'Unable to continue. Please try again.');
      this.notificationService.error(this.pageError);
    }
  }

  private async continueRenewal(planPriceId: string): Promise<void> {
    const tenantId = this.authService.getTenantId();
    if (!tenantId) {
      throw new Error('No workspace found. Please sign in again.');
    }

    this.notificationService.info('Redirecting to payment...');
    const checkoutUrl = await this.planCheckout.initiateStripeCheckout(tenantId, planPriceId);
    window.location.href = checkoutUrl;
  }

  private async continueRegistration(plan: PricingPlan, planPriceId: string): Promise<void> {
    const pending = this.flowService.getPendingRegistration();
    if (!pending) {
      throw new Error('Registration details were lost. Please go back and complete the form again.');
    }

    const mobileNumber = formatPhoneWithDialCode(pending.phone);
    if (!mobileNumber) {
      throw new Error('Please enter a valid mobile number.');
    }

    const payload: Record<string, unknown> = {
      firstName: pending.firstName.trim(),
      lastName: pending.lastName.trim(),
      email: pending.email.trim(),
      password: pending.password,
      businessName: pending.businessName.trim(),
      businessTypeId: pending.businessTypeId,
      mobileNumber,
      planId: plan.id,
      planName: plan.name,
      lastPlanId: plan.id
    };

    const description = pending.description.trim();
    if (description) {
      payload['description'] = description;
    }

    const response = await firstValueFrom(
      this.http.post<ApiResponse<RegisterData>>(API_ENDPOINTS.auth.registerAdmin, payload)
    );

    if (!response.success) {
      throw new Error(
        response.message ||
          (Array.isArray(response.errors) && response.errors[0]) ||
          'Registration failed.'
      );
    }

    const tenantId = response.data?.tenantId;
    if (!tenantId) {
      throw new Error('Account created but no tenant was returned. Please contact support.');
    }

    this.authService.setTenantId(tenantId);
    this.flowService.clearPendingRegistration();
    this.notificationService.success(response.message || 'Account created successfully.');
    this.notificationService.info('Redirecting to payment...');

    const checkoutUrl = await this.planCheckout.initiateStripeCheckout(tenantId, planPriceId);
    window.location.href = checkoutUrl;
  }

  private async loadPlans(): Promise<void> {
    this.pricingLoading = true;
    this.pricingError = '';

    try {
      this.pricingPlans = await this.planCheckout.loadPlans();
      if (!this.selectedPlanId && this.pricingPlans.length > 0) {
        const preselected = this.flowService.getPreselectedPlanId();
        this.selectedPlanId = preselected || this.pricingPlans[0].id;
      }
    } catch (error) {
      this.pricingError = getApiErrorMessage(error, 'Unable to load pricing plans right now.');
    } finally {
      this.pricingLoading = false;
    }
  }
}
