export type SubscriptionStatus =
  | 'Pending'
  | 'Active'
  | 'Expired'
  | 'Cancelled'
  | 'Suspended'
  | 'Trialing';

const SUBSCRIPTION_STATUS_BY_NUMBER: Record<number, SubscriptionStatus> = {
  0: 'Pending',
  1: 'Active',
  2: 'Expired',
  3: 'Cancelled',
  4: 'Suspended',
  5: 'Trialing'
};

const SUBSCRIPTION_STATUS_NAMES = new Set<string>(Object.values(SUBSCRIPTION_STATUS_BY_NUMBER));

export function parseSubscriptionStatus(raw: unknown): SubscriptionStatus | null {
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return SUBSCRIPTION_STATUS_BY_NUMBER[raw] ?? null;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    const asNumber = Number(trimmed);
    if (!Number.isNaN(asNumber) && Number.isInteger(asNumber)) {
      return SUBSCRIPTION_STATUS_BY_NUMBER[asNumber] ?? null;
    }
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (SUBSCRIPTION_STATUS_NAMES.has(normalized)) {
      return normalized as SubscriptionStatus;
    }
    if (SUBSCRIPTION_STATUS_NAMES.has(trimmed)) {
      return trimmed as SubscriptionStatus;
    }
  }
  return null;
}
