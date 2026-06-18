import { SubscriptionStatus } from '@shared/models/enums/subscription-status.enum';

export function requiresSubscriptionPayment(
  lastPlanId: string | null | undefined,
  status: SubscriptionStatus | null | undefined,
  planName?: string | null | undefined
): boolean {
  if (status === 'Expired' || status === 'Cancelled' || status === 'Suspended') {
    return true;
  }

  if (status === 'Active' || status === 'Trialing') {
    return false;
  }

  // Pending + chosen plan → send to checkout; Pending without plan → allow dashboard (new/incomplete setup).
  if (status === 'Pending') {
    return Boolean(lastPlanId?.trim());
  }

  // No subscription metadata yet (typical for brand-new tenants) — do not block.
  if (!status && !lastPlanId?.trim()) {
    return false;
  }

  const hasPlan = Boolean(lastPlanId?.trim() || planName?.trim());
  return !hasPlan;
}
