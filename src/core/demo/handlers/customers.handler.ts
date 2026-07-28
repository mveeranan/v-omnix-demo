import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { collectionForTenant, DemoRequestContext, fail, ok, tenantCollection, tenantSeed } from '../generic-crud';
import { getHydratedOrders } from './orders.handler';
import customersSeed from '@mock-data/customers.json';

export interface RawAddress { id: string; label: string; street: string; city: string; state: string; zip: string; country: string; isDefault: boolean }
export interface RawCustomer { id: string; name: string; email: string; phone: string; password?: string; signupDaysAgo: number; lastOrderDaysAgo: number; addresses: RawAddress[] }

const CUSTOMERS = 'customers';

function daysAgoToIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** Real-tenantId accessor used by checkout.handler.ts to find-or-create a customer record when
 * an order is placed — customers used to be purely derived from the static seed with no
 * persistence at all, so a checkout-created customer would never show up in the admin's
 * Customers page. Now backed by the same tenant-scoped persistence as every other collection. */
export function getOrCreateCustomerByEmail(
  db: DemoDbService,
  tenantId: string,
  email: string,
  details: { name: string; phone: string; password?: string }
): RawCustomer {
  const key = collectionForTenant(CUSTOMERS, tenantId);
  const list = db.getAll<RawCustomer>(key, tenantId === 'demo-tenant-1' ? (customersSeed as RawCustomer[]) : []);
  const existing = list.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;

  const created: RawCustomer = {
    id: db.newId(), name: details.name, email, phone: details.phone, password: details.password,
    signupDaysAgo: 0, lastOrderDaysAgo: 0, addresses: []
  };
  list.push(created);
  db.saveAll(key, list);
  return created;
}

/** Searches every tenant's persisted customer collection for a matching email — a storefront
 * customer login (`POST /Auth/login`) carries no tenant context in its body, unlike admin login,
 * so the only way to find the right record in demo mode is a global scan. Mirrors
 * collectionForTenant's key scheme exactly: the default tenant's collection is the bare
 * "vomnix_demo_customers" key, every other tenant is "vomnix_demo_customers:<tenantId>". */
export function findCustomerByEmailAcrossTenants(email: string): RawCustomer | null {
  const target = email.trim().toLowerCase();
  const base = 'vomnix_demo_customers';
  for (const key of Object.keys(localStorage)) {
    if (key !== base && !key.startsWith(base + ':')) continue;
    try {
      const list = JSON.parse(localStorage.getItem(key) ?? '[]') as RawCustomer[];
      const match = list.find((c) => c.email.toLowerCase() === target);
      if (match) return match;
    } catch {
      /* ignore malformed entries */
    }
  }
  return null;
}

/**
 * Customers have no separate create/update endpoint in the real app either — they're created
 * implicitly from orders. Demo mode mirrors that: this handler stays read-only, but the
 * underlying collection is now real (tenant-scoped, persisted), fed by checkout placing orders.
 */
export function handleCustomers(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (!ctx.path.startsWith('/customers')) return null;

  const raw = db.getAll<RawCustomer>(tenantCollection(CUSTOMERS, ctx), tenantSeed(customersSeed as RawCustomer[], ctx));
  const orders = getHydratedOrders(db, ctx);

  const buildSummary = (c: RawCustomer) => {
    const own = orders.filter((o) => o.customerId === c.id);
    const paid = own.filter((o) => o.paymentStatus === 'Paid');
    const lastOrder = own.slice().sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0];
    return {
      id: c.id, name: c.name, email: c.email, phone: c.phone,
      totalOrders: own.length,
      totalSpent: Math.round(paid.reduce((s, o) => s + o.grandTotal, 0) * 100) / 100,
      currency: 'INR',
      lastOrderDate: lastOrder?.placedAt ?? daysAgoToIso(c.lastOrderDaysAgo),
      signupDate: daysAgoToIso(c.signupDaysAgo)
    };
  };

  if (ctx.method === 'GET' && ctx.path === '/customers') {
    const q = ctx.query;
    const page = Number(q.get('page') ?? '1');
    const pageSize = Number(q.get('pageSize') ?? '25');
    const search = q.get('search')?.toLowerCase();

    let items = raw.map(buildSummary);
    if (search) {
      items = items.filter((c) => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));
    }
    const start = (page - 1) * pageSize;
    return ok({ items: items.slice(start, start + pageSize), total: items.length, page, pageSize });
  }

  const idMatch = ctx.path.match(/^\/customers\/([^/]+)$/);
  if (idMatch && ctx.method === 'GET') {
    const c = raw.find((x) => x.id === idMatch[1]);
    if (!c) return fail('Customer not found', 404);
    const own = orders.filter((o) => o.customerId === c.id).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
    return ok({
      ...buildSummary(c),
      addresses: c.addresses,
      orders: own.map((o) => ({ id: o.id, orderNumber: o.orderNumber, status: o.status, grandTotal: o.grandTotal, placedAt: o.placedAt }))
    });
  }

  return null;
}
