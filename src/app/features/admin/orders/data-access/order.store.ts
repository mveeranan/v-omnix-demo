import { Order } from '../models/order.model';

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'WO-482901',
    storeSlug: 'demo',
    customerName: 'Sarah Mitchell',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1 555 0101',
    shippingAddress: {
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      phone: '+1 555 0101',
      address: '123 Main St',
      city: 'Austin',
      country: 'USA',
      state: 'TX',
      zip: '78701'
    },
    items: [],
    subtotal: 149.99,
    shipping: 5,
    tax: 12,
    discount: 0,
    total: 166.99,
    currency: 'USD',
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    transactionId: 'txn_abc123',
    timeline: [
      { id: 't1', label: 'Order placed', at: new Date().toISOString(), completed: true },
      { id: 't2', label: 'Payment received', at: new Date().toISOString(), completed: true },
      { id: 't3', label: 'Shipped', at: new Date().toISOString(), completed: true },
      { id: 't4', label: 'Delivered', at: new Date().toISOString(), completed: true }
    ],
    notes: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class OrderStore {
  private orders: Order[] = SEED_ORDERS.map((o) => structuredClone(o));

  getAll(): Order[] {
    return this.orders.map((o) => structuredClone(o));
  }

  getById(id: string): Order | undefined {
    const o = this.orders.find((x) => x.id === id || x.orderNumber === id);
    return o ? structuredClone(o) : undefined;
  }

  add(order: Order): Order {
    this.orders.unshift(structuredClone(order));
    return structuredClone(order);
  }

  update(id: string, patch: Partial<Order>): Order | null {
    const idx = this.orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx < 0) return null;
    this.orders[idx] = { ...this.orders[idx], ...patch, updatedAt: new Date().toISOString() };
    return structuredClone(this.orders[idx]);
  }
}

export const orderStore = new OrderStore();
