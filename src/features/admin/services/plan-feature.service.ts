import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { PlanType } from '@shared/models/backend-enums';
import { subscriptionStore } from '../data-access/subscription.store';

const FEATURES_BY_PLAN: Record<PlanType, Set<string>> = {
  Starter: new Set(['website_builder', 'public_store', 'products', 'profile']),
  Studio: new Set([
    'website_builder',
    'public_store',
    'products',
    'profile',
    'orders',
    'customers',
    'payments',
    'reviews',
    'newsletter'
  ]),
  Master: new Set([
    'website_builder',
    'public_store',
    'products',
    'profile',
    'orders',
    'customers',
    'payments',
    'reviews',
    'newsletter',
    'returns',
    'coupons',
    'tax_rules',
    'advanced_settings',
    'brands'
  ])
};

@Injectable({ providedIn: 'root' })
export class PlanFeatureService {
  hasFeature(featureKey: string | undefined): boolean {
    if (!featureKey) return true;
    if (!environment.enablePlanGating) return true;
    const plan = subscriptionStore.refreshFromSession().planType;
    return FEATURES_BY_PLAN[plan]?.has(featureKey) ?? true;
  }

  currentPlan(): PlanType {
    return subscriptionStore.refreshFromSession().planType;
  }
}
