import { ReturnDto } from '../models/return.model';

const now = new Date().toISOString();

const SEED: ReturnDto[] = [
  {
    id: 'ret-1',
    tenantId: 'default',
    orderId: 'ord-1001',
    orderNumber: 'WO-482901',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah@example.com',
    reason: 'Wrong size',
    status: 'Pending',
    items: [{ productId: 'p1', productName: 'Classic Tee', quantity: 1, amount: 49.99 }],
    refundAmount: 49.99,
    currency: 'USD',
    notes: '',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'ret-2',
    tenantId: 'default',
    orderId: 'ord-1002',
    orderNumber: 'WO-482902',
    customerName: 'James Chen',
    customerEmail: 'james@example.com',
    reason: 'Damaged on arrival',
    status: 'Approved',
    items: [{ productId: 'p2', productName: 'Ceramic Mug', quantity: 2, amount: 36.0 }],
    refundAmount: 36.0,
    currency: 'USD',
    notes: 'Photo verified',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'ret-3',
    tenantId: 'default',
    orderId: 'ord-1003',
    orderNumber: 'WO-482903',
    customerName: 'Emma Rodriguez',
    customerEmail: 'emma@example.com',
    reason: 'Changed mind',
    status: 'Completed',
    items: [{ productId: 'p3', productName: 'Linen Tote', quantity: 1, amount: 78.5 }],
    refundAmount: 78.5,
    currency: 'USD',
    notes: 'Refund processed',
    createdAt: now,
    updatedAt: now
  }
];

class ReturnStore {
  private returns = structuredClone(SEED);

  getAll(): ReturnDto[] {
    return [...this.returns].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): ReturnDto | undefined {
    return this.returns.find((r) => r.id === id);
  }

  create(input: Omit<ReturnDto, 'id' | 'createdAt' | 'updatedAt'>): ReturnDto {
    const ts = new Date().toISOString();
    const item: ReturnDto = {
      ...input,
      id: `ret-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: ts,
      updatedAt: ts
    };
    this.returns.push(item);
    return item;
  }

  update(id: string, patch: Partial<ReturnDto>): ReturnDto | null {
    const idx = this.returns.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    this.returns[idx] = { ...this.returns[idx], ...patch, updatedAt: new Date().toISOString() };
    return this.returns[idx];
  }

  delete(id: string): boolean {
    const before = this.returns.length;
    this.returns = this.returns.filter((r) => r.id !== id);
    return this.returns.length < before;
  }

  replaceAll(items: ReturnDto[]): void {
    this.returns = structuredClone(items);
  }
}

export const returnStore = new ReturnStore();
