import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { DemoRequestContext, fail, ok } from '../generic-crud';
import { getTenantProducts } from './products.handler';
import { getOrCreateCustomerByEmail, RawCustomer } from './customers.handler';
import { createOrder, getHydratedOrders, HydratedOrderItem } from './orders.handler';
import { resolveTenantIdOrSlug } from './tenant-site.handler';

const GST_RATE = 0.05;

interface CheckoutLineRequest { productId: string; variantId?: string | null; quantity: number }
interface CheckoutAddressInput {
  firstName?: string; lastName?: string; line1?: string; line2?: string;
  city?: string; state?: string; zip?: string; country?: string; phone?: string;
}

/** Server-authoritative pricing: recompute every line from the tenant's REAL product prices,
 * ignoring whatever the client sent — same principle the real backend follows (never trust
 * client-supplied prices for a checkout total). */
function priceLines(db: DemoDbService, tenantId: string, items: CheckoutLineRequest[]) {
  const products = getTenantProducts(db, tenantId);
  const lines = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    const variant = item.variantId ? product?.variants.find((v) => v.id === item.variantId) : undefined;
    const unitPrice = variant?.price ?? product?.price ?? 0;
    return {
      productId: item.productId, variantId: item.variantId ?? null,
      productName: product?.name ?? 'Product', sku: variant?.sku ?? product?.sku ?? '',
      quantity: item.quantity, unitPrice,
      lineTotal: Math.round(unitPrice * item.quantity * 100) / 100
    };
  });
  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const taxAmount = Math.round(subtotal * GST_RATE * 100) / 100;
  const shippingAmount = 0; // Free shipping in demo mode — no shipping-zone rate table to price against.
  const discountAmount = 0; // Coupon validation isn't wired up in demo mode yet.
  const grandTotal = Math.round((subtotal + taxAmount + shippingAmount - discountAmount) * 100) / 100;
  return { lines, subtotal, taxAmount, shippingAmount, discountAmount, grandTotal };
}

function toHydratedItems(lines: ReturnType<typeof priceLines>['lines']): HydratedOrderItem[] {
  return lines.map((l) => ({
    productId: l.productId, variantId: l.variantId, productName: l.productName, sku: l.sku,
    quantity: l.quantity, unitPrice: l.unitPrice, totalPrice: l.lineTotal
  }));
}

export function handleCheckout(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (!ctx.path.startsWith('/checkout')) return null;

  if (ctx.path === '/checkout/quote' && ctx.method === 'POST') {
    const body = (ctx.body ?? {}) as { storeSlug?: string; items?: CheckoutLineRequest[] };
    const tenantId = resolveTenantIdOrSlug(db, body.storeSlug ?? '');
    if (!tenantId) return fail('Store not found.', 404);
    const priced = priceLines(db, tenantId, body.items ?? []);
    return ok({ ...priced, currency: 'USD', warnings: [] });
  }

  if (ctx.path === '/checkout/place-order' && ctx.method === 'POST') {
    const body = (ctx.body ?? {}) as {
      storeSlug?: string; email?: string; password?: string;
      shippingAddress?: CheckoutAddressInput;
      paymentProvider?: number;
      items?: CheckoutLineRequest[];
    };
    const tenantId = resolveTenantIdOrSlug(db, body.storeSlug ?? '');
    if (!tenantId) return fail('Store not found.', 404);
    if (!body.items?.length) return fail('Your cart is empty.', 400);

    const priced = priceLines(db, tenantId, body.items);
    const addr = body.shippingAddress ?? {};
    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ').trim() || 'Guest';
    const email = (body.email ?? '').trim().toLowerCase();

    // A real customer identity is optional (guest checkout is valid) — only find-or-create one
    // when an email was actually given, same as the real backend would. The password set here
    // (new accounts only) is what /Auth/login checks later when the customer returns to log in.
    const customer: RawCustomer | null = email
      ? getOrCreateCustomerByEmail(db, tenantId, email, { name: fullName, phone: addr.phone ?? '', password: body.password })
      : null;

    // COD stays "Pending" like a real unpaid order; every other provider is treated as an
    // instantly-successful mock payment (there's no real payment gateway in demo mode).
    const paymentStatus = body.paymentProvider === 5 ? 'Pending' : 'Paid';

    const order = createOrder(db, tenantId, {
      customerId: customer?.id ?? 'guest',
      customerName: customer?.name ?? fullName,
      customerEmail: customer?.email ?? email,
      customerPhone: customer?.phone ?? addr.phone ?? '',
      shippingAddress: {
        fullName, phone: addr.phone ?? null,
        addressLine1: addr.line1 ?? '', addressLine2: addr.line2 ?? null,
        city: addr.city ?? '', state: addr.state ?? null, postalCode: addr.zip ?? null, country: addr.country ?? null
      },
      items: toHydratedItems(priced.lines),
      subtotal: priced.subtotal, taxAmount: priced.taxAmount, discountAmount: priced.discountAmount,
      shippingAmount: priced.shippingAmount, grandTotal: priced.grandTotal,
      currency: 'USD', paymentMethod: 'card', paymentStatus
    });

    return ok({
      orderId: order.id, orderNumber: order.orderNumber, status: order.status,
      quote: { ...priced, currency: 'USD', warnings: [] },
      payment: null, requiresPaymentAction: false
    }, 'Order placed');
  }

  if (ctx.path === '/checkout/my-orders' && ctx.method === 'GET') {
    const storeSlug = ctx.query.get('storeSlug') ?? '';
    const tenantId = resolveTenantIdOrSlug(db, storeSlug);
    const customerId = localStorage.getItem('store_customer_id');
    if (!tenantId || !customerId) return ok([]);
    const orders = getHydratedOrders(db, { ...ctx, tenantId }).filter((o) => o.customerId === customerId);
    return ok(orders.map((o) => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status, paymentStatus: o.paymentStatus,
      grandTotal: o.grandTotal, currency: o.currency, placedAt: o.placedAt,
      items: o.items.map((i) => ({ id: i.productId, productName: i.productName, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice }))
    })));
  }

  if (ctx.path === '/checkout/my-profile' && ctx.method === 'GET') {
    const storeSlug = ctx.query.get('storeSlug') ?? '';
    const tenantId = resolveTenantIdOrSlug(db, storeSlug);
    const customerId = localStorage.getItem('store_customer_id');
    if (!tenantId || !customerId) return fail('Not logged in.', 401);

    // No dedicated "saved address" record in demo mode — reuse the shipping address from the
    // customer's most recent order, same effect for a returning customer (skips the address form).
    const lastOrder = getHydratedOrders(db, { ...ctx, tenantId })
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0];
    const addr = lastOrder?.shippingAddress;

    return ok({
      firstName: localStorage.getItem('store_customer_first_name') ?? '',
      lastName: localStorage.getItem('store_customer_last_name') ?? '',
      email: localStorage.getItem('store_customer_email') ?? '',
      phone: localStorage.getItem('store_customer_mobile') ?? '',
      hasSavedAddress: !!addr,
      address: addr ? {
        fullName: addr.fullName, phone: addr.phone ?? undefined,
        line1: addr.addressLine1, line2: addr.addressLine2 ?? undefined,
        city: addr.city, state: addr.state ?? undefined,
        postalCode: addr.postalCode ?? undefined, countryIsoCode: addr.country ?? undefined
      } : null
    });
  }

  return null;
}
