import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { collectionForTenant, DemoRequestContext, fail, ok, seedForTenant, tenantCollection, tenantSeed } from '../generic-crud';
import ordersSeed from '@mock-data/orders.json';
import productsSeed from '@mock-data/products.json';
import customersSeed from '@mock-data/customers.json';

interface RawOrderItem { productId: string; quantity: number }
interface RawOrder {
  id: string; orderNumber: string; customerId: string;
  status: string; paymentStatus: string; paymentMethod: string; placedDaysAgo: number;
  items: RawOrderItem[]; shippingAmount: number; discountAmount: number; couponCode: string | null;
}
interface RawCustomer { id: string; name: string; email: string; phone: string; addresses: Array<{ fullNameFallback?: string; street: string; city: string; state: string; zip: string; country: string }> }

export interface HydratedOrderItem {
  productId: string; variantId: string | null; productName: string | null; sku: string | null;
  quantity: number; unitPrice: number; totalPrice: number;
}
export interface HydratedOrder {
  id: string; orderNumber: string; status: string; paymentStatus: string;
  subtotal: number; taxAmount: number; discountAmount: number; shippingAmount: number; grandTotal: number;
  currency: string; paymentMethod: string;
  placedAt: string; confirmedAt: string | null; shippedAt: string | null; deliveredAt: string | null; cancelledAt: string | null;
  createdAt: string; updatedAt: string;
  customerId: string; customerName: string; customerEmail: string; customerPhone: string;
  shippingAddress: { fullName: string; phone: string | null; addressLine1: string; addressLine2: string | null; city: string; state: string | null; postalCode: string | null; country: string | null };
  items: HydratedOrderItem[];
  notes: Array<{ id: string; text: string; authorName: string; createdAt: string }>;
  timeline: Array<{ oldStatus: string | null; newStatus: string; changedAt: string }>;
}

const STATUS_ORDER = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
const GST_RATE = 0.05;
const COLLECTION = 'orders';

function daysAgoToIso(days: number, hourOffset = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hourOffset, 0, 0, 0);
  return d.toISOString();
}

function buildSeed(): HydratedOrder[] {
  const products = productsSeed as Array<{ id: string; name: string; sku: string; price: number }>;
  const customers = customersSeed as unknown as Array<{ id: string; name: string; email: string; phone: string; addresses: Array<{ street: string; city: string; state: string; zip: string; country: string }> }>;

  return (ordersSeed as RawOrder[]).map((raw) => {
    const customer = customers.find((c) => c.id === raw.customerId);
    const addr = customer?.addresses[0];
    const items: HydratedOrderItem[] = raw.items.map((it) => {
      const product = products.find((p) => p.id === it.productId);
      const unitPrice = product?.price ?? 0;
      return {
        productId: it.productId, variantId: null,
        productName: product?.name ?? 'Product', sku: product?.sku ?? null,
        quantity: it.quantity, unitPrice, totalPrice: Math.round(unitPrice * it.quantity * 100) / 100
      };
    });
    const subtotal = Math.round(items.reduce((s, i) => s + i.totalPrice, 0) * 100) / 100;
    const taxAmount = Math.round(subtotal * GST_RATE * 100) / 100;
    const grandTotal = Math.round((subtotal + taxAmount + raw.shippingAmount - raw.discountAmount) * 100) / 100;

    const placedAt = daysAgoToIso(raw.placedDaysAgo);
    const statusIdx = STATUS_ORDER.indexOf(raw.status);
    const timeline = statusIdx > 0
      ? STATUS_ORDER.slice(1, statusIdx + 1).map((s, i) => ({
          oldStatus: STATUS_ORDER[i], newStatus: s,
          changedAt: daysAgoToIso(Math.max(raw.placedDaysAgo - (i + 1), 0), 14)
        }))
      : raw.status === 'Cancelled'
        ? [{ oldStatus: 'Pending', newStatus: 'Cancelled', changedAt: daysAgoToIso(Math.max(raw.placedDaysAgo - 1, 0), 14) }]
        : [];

    return {
      id: raw.id, orderNumber: raw.orderNumber, status: raw.status, paymentStatus: raw.paymentStatus,
      subtotal, taxAmount, discountAmount: raw.discountAmount, shippingAmount: raw.shippingAmount, grandTotal,
      currency: 'INR', paymentMethod: raw.paymentMethod,
      placedAt,
      confirmedAt: statusIdx >= 1 ? timeline[0]?.changedAt ?? null : null,
      shippedAt: statusIdx >= 3 ? timeline[2]?.changedAt ?? null : null,
      deliveredAt: statusIdx >= 4 ? timeline[3]?.changedAt ?? null : null,
      cancelledAt: raw.status === 'Cancelled' ? timeline[0]?.changedAt ?? null : null,
      createdAt: placedAt, updatedAt: timeline.length ? timeline[timeline.length - 1].changedAt : placedAt,
      customerId: raw.customerId, customerName: customer?.name ?? 'Guest',
      customerEmail: customer?.email ?? '', customerPhone: customer?.phone ?? '',
      shippingAddress: {
        fullName: customer?.name ?? 'Guest', phone: customer?.phone ?? null,
        addressLine1: addr?.street ?? '', addressLine2: null,
        city: addr?.city ?? '', state: addr?.state ?? null, postalCode: addr?.zip ?? null, country: addr?.country ?? null
      },
      items,
      notes: [],
      timeline
    };
  });
}

export function getHydratedOrders(db: DemoDbService, ctx: DemoRequestContext): HydratedOrder[] {
  return db.getAll<HydratedOrder>(tenantCollection(COLLECTION, ctx), tenantSeed(buildSeed(), ctx));
}

let orderSequence = 0;

/** Appends a brand-new order to a tenant's persisted orders collection — used by
 * checkout.handler.ts when a storefront customer actually places an order, so it shows up in
 * the admin's Orders page and in that customer's own order history immediately. */
export function createOrder(
  db: DemoDbService,
  tenantId: string,
  input: {
    customerId: string; customerName: string; customerEmail: string; customerPhone: string;
    shippingAddress: HydratedOrder['shippingAddress'];
    items: HydratedOrderItem[];
    subtotal: number; taxAmount: number; discountAmount: number; shippingAmount: number; grandTotal: number;
    currency: string; paymentMethod: string; paymentStatus: string;
  }
): HydratedOrder {
  const key = collectionForTenant(COLLECTION, tenantId);
  const list = db.getAll<HydratedOrder>(key, seedForTenant(buildSeed(), tenantId));
  const now = new Date().toISOString();
  const order: HydratedOrder = {
    id: db.newId(),
    orderNumber: `ORD-${20000 + orderSequence++}-${Math.floor(Math.random() * 900 + 100)}`,
    status: 'Pending', paymentStatus: input.paymentStatus,
    subtotal: input.subtotal, taxAmount: input.taxAmount, discountAmount: input.discountAmount,
    shippingAmount: input.shippingAmount, grandTotal: input.grandTotal,
    currency: input.currency, paymentMethod: input.paymentMethod,
    placedAt: now, confirmedAt: null, shippedAt: null, deliveredAt: null, cancelledAt: null,
    createdAt: now, updatedAt: now,
    customerId: input.customerId, customerName: input.customerName, customerEmail: input.customerEmail,
    customerPhone: input.customerPhone, shippingAddress: input.shippingAddress,
    items: input.items, notes: [],
    timeline: []
  };
  list.push(order);
  db.saveAll(key, list);
  return order;
}

function toSummary(o: HydratedOrder) {
  return {
    id: o.id, orderNumber: o.orderNumber, customerName: o.customerName, customerEmail: o.customerEmail,
    status: o.status, paymentStatus: o.paymentStatus, grandTotal: o.grandTotal, currency: o.currency, placedAt: o.placedAt
  };
}

function isSameMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function handleOrders(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (!ctx.path.startsWith('/orders')) return null;

  if (ctx.method === 'GET' && ctx.path === '/orders') {
    const q = ctx.query;
    let items = getHydratedOrders(db, ctx).slice().sort((a, b) => b.placedAt.localeCompare(a.placedAt));

    const search = q.get('search')?.toLowerCase();
    const status = q.get('status');
    const paymentStatus = q.get('paymentStatus');
    if (search) items = items.filter((o) => o.orderNumber.toLowerCase().includes(search) || o.customerName.toLowerCase().includes(search));
    if (status) items = items.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    if (paymentStatus) items = items.filter((o) => o.paymentStatus.toLowerCase() === paymentStatus.toLowerCase());

    const page = Number(q.get('page') ?? '1');
    const pageSize = Number(q.get('pageSize') ?? '25');
    const start = (page - 1) * pageSize;

    const allOrders = getHydratedOrders(db, ctx);
    const revenueThisMonth = Math.round(
      allOrders.filter((o) => o.paymentStatus === 'Paid' && isSameMonth(o.placedAt)).reduce((s, o) => s + o.grandTotal, 0) * 100
    ) / 100;
    const ordersThisMonth = allOrders.filter((o) => isSameMonth(o.placedAt)).length;

    return ok({
      items: items.slice(start, start + pageSize).map(toSummary),
      total: items.length, page, pageSize, revenueThisMonth, ordersThisMonth
    });
  }

  const idMatch = ctx.path.match(/^\/orders\/([^/]+)$/);
  if (idMatch && ctx.method === 'GET') {
    const order = getHydratedOrders(db, ctx).find((o) => o.id === idMatch[1]);
    return order ? ok(order) : fail('Order not found', 404);
  }

  const statusMatch = ctx.path.match(/^\/orders\/([^/]+)\/status$/);
  if (statusMatch && (ctx.method === 'PATCH' || ctx.method === 'PUT')) {
    const orders = getHydratedOrders(db, ctx);
    const idx = orders.findIndex((o) => o.id === statusMatch[1]);
    if (idx === -1) return fail('Order not found', 404);
    const body = (ctx.body ?? {}) as { status: string; trackingNumber?: string; carrier?: string; note?: string };
    const nowIso = new Date().toISOString();
    const updated: HydratedOrder = {
      ...orders[idx],
      status: body.status,
      timeline: [...orders[idx].timeline, { oldStatus: orders[idx].status, newStatus: body.status, changedAt: nowIso }],
      updatedAt: nowIso
    };
    if (body.note) {
      updated.notes = [...updated.notes, { id: db.newId(), text: body.note, authorName: 'You', createdAt: nowIso }];
    }
    orders[idx] = updated;
    db.saveAll(tenantCollection(COLLECTION, ctx), orders);
    return ok(updated, 'Order status updated');
  }

  const noteMatch = ctx.path.match(/^\/orders\/([^/]+)\/notes$/);
  if (noteMatch && ctx.method === 'POST') {
    const orders = getHydratedOrders(db, ctx);
    const idx = orders.findIndex((o) => o.id === noteMatch[1]);
    if (idx === -1) return fail('Order not found', 404);
    const body = (ctx.body ?? {}) as { text: string };
    const note = { id: db.newId(), text: body.text, authorName: 'You', createdAt: new Date().toISOString() };
    orders[idx] = { ...orders[idx], notes: [...orders[idx].notes, note] };
    db.saveAll(tenantCollection(COLLECTION, ctx), orders);
    return ok(note, 'Note added');
  }

  return null;
}
