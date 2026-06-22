export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PlanPrice {
  planPriceId: string;
  billingCycle: 'Monthly' | 'Yearly' | string;
  amount: number;
  currency: string;
  stripePriceId: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice?: PlanPrice;
  annualPrice?: PlanPrice;
  description: string;
  popular?: boolean;
  features: PricingFeature[];
}

export interface PlanApiDto {
  planId: string;
  name: string;
  prices: PlanPrice[];
  features: Array<{
    id: string;
    name: string;
  }>;
}

export type PlanSelectionFlow = 'register' | 'renew';

export function buildPlanDescription(planName: string): string {
  const normalized = planName.toLowerCase();
  if (normalized.includes('starter')) {
    return 'For early-stage teams launching their first online store.';
  }
  if (normalized.includes('silver') || normalized.includes('growth')) {
    return 'For growing teams scaling operations across locations.';
  }
  if (normalized.includes('gold') || normalized.includes('pro') || normalized.includes('enterprise')) {
    return 'For high-volume operators that need enterprise-grade controls.';
  }
  return 'A scalable plan designed for e-commerce growth.';
}

export function mapApiPlan(plan: PlanApiDto, index: number): PricingPlan {
  const monthlyPrice = plan.prices.find((price) => price.billingCycle === 'Monthly');
  const annualPrice = plan.prices.find((price) => price.billingCycle === 'Yearly');

  return {
    id: plan.planId,
    name: plan.name,
    description: buildPlanDescription(plan.name),
    popular: index === 1,
    monthlyPrice,
    annualPrice,
    features: plan.features.map((feature) => ({
      name: feature.name,
      included: true
    }))
  };
}

export function getPlanPrice(plan: PricingPlan, annual: boolean): PlanPrice | undefined {
  return annual ? plan.annualPrice : plan.monthlyPrice;
}

export function getDisplayPrice(plan: PricingPlan, annual: boolean): string {
  const price = getPlanPrice(plan, annual);
  if (!price) {
    return '--';
  }
  return Number.isInteger(price.amount) ? price.amount.toString() : price.amount.toFixed(2);
}

export function getDisplayCurrency(plan: PricingPlan, annual: boolean): string {
  const price = getPlanPrice(plan, annual);
  return price?.currency ?? 'USD';
}
