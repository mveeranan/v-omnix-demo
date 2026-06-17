import { Coupon } from '../models/coupon.model';

const SEED: Coupon[] = [
  {
    id: 'cpn-save10',
    tenantId: 'default',
    code: 'SAVE10',
    description: '10% off entire order',
    discountType: 'Percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxUses: 1000,
    useCount: 42,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'cpn-welcome5',
    tenantId: 'default',
    code: 'WELCOME5',
    description: '5% welcome discount for new customers',
    discountType: 'Percentage',
    discountValue: 5,
    minOrderAmount: 25,
    maxUses: undefined,
    useCount: 128,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];

class CouponStore {
  private coupons = structuredClone(SEED);

  getAll(): Coupon[] {
    return [...this.coupons].sort((a, b) => a.code.localeCompare(b.code));
  }

  getById(id: string): Coupon | undefined {
    return this.coupons.find((c) => c.id === id);
  }

  getByCode(code: string): Coupon | undefined {
    return this.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
  }

  create(input: Omit<Coupon, 'id' | 'createdAt' | 'useCount'>): Coupon {
    const item: Coupon = {
      ...input,
      id: `cpn-${crypto.randomUUID().slice(0, 8)}`,
      code: input.code.toUpperCase(),
      useCount: 0,
      createdAt: new Date().toISOString()
    };
    this.coupons.push(item);
    return item;
  }

  update(id: string, patch: Partial<Coupon>): Coupon | null {
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    const next = { ...this.coupons[idx], ...patch };
    if (patch.code) next.code = patch.code.toUpperCase();
    this.coupons[idx] = next;
    return this.coupons[idx];
  }

  delete(id: string): boolean {
    const before = this.coupons.length;
    this.coupons = this.coupons.filter((c) => c.id !== id);
    return this.coupons.length < before;
  }

  replaceAll(items: Coupon[]): void {
    this.coupons = structuredClone(items);
  }
}

export const couponStore = new CouponStore();
