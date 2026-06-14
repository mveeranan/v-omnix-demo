import {
  BillingCycle,
  PlanType,
  SubscriptionStatus
} from '../../../shared/models/backend-enums';

export interface SubscriptionStatusDto {
  status: SubscriptionStatus;
  planType: PlanType;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isTrialing: boolean;
  cancelAtPeriodEnd: boolean;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planType: PlanType;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  priceMonthly: number;
  priceYearly: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  cancelAtPeriodEnd: boolean;
  features: string[];
}

export const PLAN_PRICING: Record<PlanType, { monthly: number; yearly: number; features: string[] }> = {
  Starter: {
    monthly: 29,
    yearly: 290,
    features: ['Up to 50 products', 'Basic website builder', 'Order management', 'Email support']
  },
  Studio: {
    monthly: 79,
    yearly: 790,
    features: ['Unlimited products', 'Advanced website builder', 'Coupons & reviews', 'Priority support']
  },
  Master: {
    monthly: 149,
    yearly: 1490,
    features: ['Everything in Studio', 'Multi-branch', 'Tax rules', 'Dedicated account manager']
  }
};
