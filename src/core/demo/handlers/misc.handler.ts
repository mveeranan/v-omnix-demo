import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { DemoRequestContext, ok, simpleCrud } from '../generic-crud';

interface GenericEntity { id: string; [key: string]: unknown }

function genericEntity(body: Record<string, unknown>, id: string): GenericEntity {
  return { ...body, id };
}
function genericUpdate(existing: GenericEntity, body: Record<string, unknown>): GenericEntity {
  return { ...existing, ...body, id: existing.id };
}

/**
 * Long-tail endpoints that exist in the real API but aren't part of the core admin demo
 * (storefront theming, coupons, reviews, returns, newsletter, cart, checkout, portfolio/website
 * builder, tenant profile). Each of these is either:
 *  - a simple named-entity CRUD list (coupons/reviews/returns/store-feedback) -> generic CRUD, or
 *  - a "no data yet" read that the real UI already renders gracefully when empty/null.
 * This guarantees demo mode never lets a request silently hit the network or hang — every
 * endpoint in API_ENDPOINTS resolves to *something* here or in one of the other handlers.
 */
export function handleMisc(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  // Must be checked before the generic /coupons CRUD below — simpleCrud would otherwise treat
  // "validate" as an :id segment on an unsupported method and 405 instead of validating.
  if (ctx.path === '/coupons/validate' && ctx.method === 'POST') {
    return ok({ valid: false, message: 'No matching coupon.' });
  }

  const coupons = simpleCrud<GenericEntity>(db, 'coupons', [], '/coupons', ctx, genericEntity, genericUpdate);
  if (coupons) return coupons;

  const reviews = simpleCrud<GenericEntity>(db, 'reviews', [], '/reviews', ctx, genericEntity, genericUpdate);
  if (reviews) return reviews;

  const returns = simpleCrud<GenericEntity>(db, 'returns', [], '/returns', ctx, genericEntity, genericUpdate);
  if (returns) return returns;

  const feedback = simpleCrud<GenericEntity>(db, 'storeFeedback', [], '/store-feedback', ctx, genericEntity, genericUpdate);
  if (feedback) return feedback;

  // Business profile, personal info, hero slides, social media, and the website builder/publish
  // flow are all handled by tenant-site.handler.ts (which persists them for real, tenant-scoped —
  // they used to be no-op stubs here, which is why Profile/Personal Info never loaded and a
  // published store could never be found). The public storefront catalog is handled by
  // store-catalog.handler.ts. Only genuinely long-tail, not-yet-built reads remain here.
  if (ctx.path === '/tenant' && ctx.method === 'GET') return ok(null);
  if (ctx.path === '/ecommerce-configuration') return ok(ctx.method === 'GET' ? null : ctx.body);
  if (ctx.path === '/newsletter/subscribers' && ctx.method === 'GET') return ok([]);
  if (ctx.path === '/newsletter/subscribe' && ctx.method === 'POST') return ok(true, 'Subscribed');
  // Cart is only ever hit for a LOGGED-IN storefront customer (CartStateService keeps a pure
  // client-side localStorage cart otherwise, which already works with zero backend involvement).
  // Customer login/registration isn't wired up in demo mode yet, so this path is unreachable in
  // practice — kept as a well-formed (not wrong-shaped) fallback rather than silently wiping a
  // cart if that ever changes.
  if (ctx.path === '/cart' || ctx.path.startsWith('/cart/items')) {
    return ok({ id: 'demo-cart', items: [], subtotal: 0, itemCount: 0, currency: 'USD' });
  }
  if (ctx.path === '/payments/methods' && ctx.method === 'GET') return ok([]);

  return null;
}
