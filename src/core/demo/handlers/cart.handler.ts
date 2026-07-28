import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { DemoRequestContext, ok, fail } from '../generic-crud';

/** Matches CartItemResponse in cart-api.service.ts exactly — every field the
 * real client reads (imageUrl, currency, productSlug) must be present or the
 * CurrencyPipe/img binding in cart-drawer/cart-page throws on render. */
interface DemoCartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantId?: string | null;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  currency: string;
}

interface DemoCart {
  items: DemoCartItem[];
}

function cartKey(tenantId: string): string {
  return `cart_${tenantId}`;
}

function getCart(db: DemoDbService, tenantId: string): DemoCart {
  return db.getObject<DemoCart>(cartKey(tenantId), { items: [] });
}

function saveCart(db: DemoDbService, tenantId: string, cart: DemoCart): void {
  db.saveObject(cartKey(tenantId), cart);
}

/** Matches CartResponse in cart-api.service.ts exactly. */
function toCartResponse(cart: DemoCart) {
  const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const currency = cart.items[0]?.currency ?? 'USD';
  return { id: 'demo-cart', items: cart.items, subtotal, itemCount, currency };
}

export function handleCart(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (!ctx.path.startsWith('/cart')) return null;

  const tenantId = ctx.tenantId;
  if (!tenantId) return fail('Not authenticated.', 401);

  if (ctx.path === '/cart' && ctx.method === 'GET') {
    return ok(toCartResponse(getCart(db, tenantId)));
  }

  if (ctx.path === '/cart/items' && ctx.method === 'POST') {
    const body = (ctx.body ?? {}) as {
      productId?: string; variantId?: string; quantity?: number; unitPrice?: number;
      productName?: string; productSlug?: string; imageUrl?: string; variantName?: string;
    };
    const cart = getCart(db, tenantId);
    const existing = cart.items.find(
      (i) => i.productId === body.productId && (i.variantId ?? '') === (body.variantId ?? '')
    );

    if (existing) {
      existing.quantity += body.quantity ?? 1;
    } else {
      cart.items.push({
        id: db.newId(),
        productId: body.productId ?? '',
        productName: body.productName ?? 'Product',
        productSlug: body.productSlug ?? '',
        imageUrl: body.imageUrl ?? '',
        variantId: body.variantId ?? null,
        variantName: body.variantName ?? null,
        unitPrice: body.unitPrice ?? 0,
        quantity: body.quantity ?? 1,
        currency: 'USD'
      });
    }
    saveCart(db, tenantId, cart);
    return ok(toCartResponse(cart), 'Item added');
  }

  const itemMatch = ctx.path.match(/^\/cart\/items\/([^/]+)$/);

  if (itemMatch && ctx.method === 'PUT') {
    const productId = decodeURIComponent(itemMatch[1]);
    const body = (ctx.body ?? {}) as { quantity?: number };
    const cart = getCart(db, tenantId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return fail('Item not found.', 404);
    item.quantity = Math.max(1, body.quantity ?? 1);
    saveCart(db, tenantId, cart);
    return ok(toCartResponse(cart));
  }

  if (itemMatch && ctx.method === 'DELETE') {
    const productId = decodeURIComponent(itemMatch[1]);
    const body = (ctx.body ?? {}) as { variantId?: string };
    const cart = getCart(db, tenantId);
    cart.items = cart.items.filter(
      (i) => !(i.productId === productId && (i.variantId ?? '') === (body.variantId ?? ''))
    );
    saveCart(db, tenantId, cart);
    return ok(toCartResponse(cart), 'Item removed');
  }

  if (ctx.path === '/cart' && ctx.method === 'DELETE') {
    saveCart(db, tenantId, { items: [] });
    return ok('Cleared');
  }

  return null;
}
