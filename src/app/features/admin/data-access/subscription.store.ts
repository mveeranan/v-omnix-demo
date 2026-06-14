import { BillingCycle, PlanType } from '../../../shared/models/backend-enums';
import { PLAN_PRICING, SubscriptionStatusDto, TenantSubscription } from '../models/subscription.model';

const PLAN_STORAGE_KEYS = ['plan_name', 'work-orbit.tenant.planName'] as const;

function readPlanName(): PlanType {
  for (const key of PLAN_STORAGE_KEYS) {
    for (const storage of [sessionStorage, localStorage] as const) {
      const raw = storage.getItem(key);
      if (raw === 'Starter' || raw === 'Studio' || raw === 'Master') {
        return raw;
      }
    }
  }
  return 'Starter';
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

class SubscriptionStore {
  private subscription: TenantSubscription = this.buildSubscription();

  get(): TenantSubscription {
    return structuredClone(this.subscription);
  }

  getStatus(): SubscriptionStatusDto {
    const sub = this.subscription;
    return {
      status: sub.status,
      planType: sub.planType,
      billingCycle: sub.billingCycle,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      isTrialing: sub.status === 'Trialing',
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd
    };
  }

  refreshFromSession(): TenantSubscription {
    this.subscription = this.buildSubscription();
    return this.get();
  }

  updateBillingCycle(cycle: BillingCycle): TenantSubscription {
    this.subscription.billingCycle = cycle;
    return this.get();
  }

  cancelAtPeriodEnd(cancel: boolean): TenantSubscription {
    this.subscription.cancelAtPeriodEnd = cancel;
    return this.get();
  }

  private buildSubscription(): TenantSubscription {
    const planType = readPlanName();
    const pricing = PLAN_PRICING[planType];
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = addMonths(periodStart, 1);

    return {
      id: 'sub-default',
      tenantId: 'default',
      planType,
      billingCycle: 'Monthly',
      status: 'Active',
      priceMonthly: pricing.monthly,
      priceYearly: pricing.yearly,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
      features: [...pricing.features]
    };
  }
}

export const subscriptionStore = new SubscriptionStore();
