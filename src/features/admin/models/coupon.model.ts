import { DiscountType } from '@shared/models/backend-enums';

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export function createEmptyCoupon(): Omit<Coupon, 'id' | 'createdAt' | 'usageCount' | 'tenantId'> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);

  return {
    code: '',
    discountType: 'Percentage',
    discountValue: 10,
    minimumOrderAmount: undefined,
    maximumDiscountAmount: undefined,
    usageLimit: undefined,
    isActive: true,
    startDate: now.toISOString(),
    endDate: tomorrow.toISOString()
  };
}
