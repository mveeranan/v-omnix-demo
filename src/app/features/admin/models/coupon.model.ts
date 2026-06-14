import { DiscountType } from '../../../shared/models/backend-enums';

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  useCount: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export function createEmptyCoupon(tenantId = 'default'): Omit<Coupon, 'id' | 'createdAt' | 'useCount'> {
  return {
    tenantId,
    code: '',
    description: '',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: undefined,
    isActive: true,
    startsAt: undefined,
    expiresAt: undefined
  };
}
