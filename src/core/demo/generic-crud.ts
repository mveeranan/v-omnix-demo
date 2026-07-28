import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from './demo-db.service';
import { ApiResponse } from '@shared/models/api-response.model';

export interface DemoRequestContext {
  method: string;
  /** URL with the API base and query string stripped off, e.g. "/product-tags/abc-123". */
  path: string;
  query: URLSearchParams;
  body: unknown;
  tenantId: string | null;
}

/** The tenant baked into users.json's seed record — the only tenant whose collections get the
 * rich, hand-authored sample data. Every other (newly registered) tenant starts empty, so a
 * fresh signup behaves like a genuinely new store rather than seeing someone else's catalog. */
export const DEFAULT_DEMO_TENANT_ID = 'demo-tenant-1';

/** Shared storage-key name for a tenant's business profile record — defined here (rather than in
 * tenant-site.handler.ts) so auth.handler.ts can seed one at registration time without creating a
 * circular import between the two handler files. */
export const BUSINESS_PROFILE_COLLECTION = 'businessProfile';

/** Storage key for a tenant-owned collection, given a raw tenant id. The default demo tenant
 * keeps the bare collection name (so existing seeded/persisted data for it is unaffected); every
 * other tenant gets its own suffixed key, giving it an independent, isolated "database". Used
 * both for the caller's own tenant (via tenantCollection) and for a tenant resolved some other
 * way, e.g. from a storefront slug (public catalog browsing isn't "logged in" as that tenant). */
export function collectionForTenant(collection: string, tenantId: string | null): string {
  const id = tenantId ?? DEFAULT_DEMO_TENANT_ID;
  return id === DEFAULT_DEMO_TENANT_ID ? collection : `${collection}:${id}`;
}

/** Only the default demo tenant gets the hand-authored seed data; any other tenant starts empty. */
export function seedForTenant<T>(seed: readonly T[], tenantId: string | null): readonly T[] {
  const id = tenantId ?? DEFAULT_DEMO_TENANT_ID;
  return id === DEFAULT_DEMO_TENANT_ID ? seed : [];
}

/** Storage key for a tenant-owned collection, scoped to the request's own tenant (ctx.tenantId). */
export function tenantCollection(collection: string, ctx: DemoRequestContext): string {
  return collectionForTenant(collection, ctx.tenantId);
}

/** Only the default demo tenant gets the hand-authored seed data; any other tenant starts empty. */
export function tenantSeed<T>(seed: readonly T[], ctx: DemoRequestContext): readonly T[] {
  return seedForTenant(seed, ctx.tenantId);
}

export function ok<T>(data: T, message = 'OK'): HttpResponse<ApiResponse<T>> {
  return new HttpResponse({ status: 200, body: { success: true, message, data } });
}

export function created<T>(data: T, message = 'Created'): HttpResponse<ApiResponse<T>> {
  return new HttpResponse({ status: 201, body: { success: true, message, data } });
}

export function fail(message: string, status = 400): HttpResponse<ApiResponse<null>> {
  return new HttpResponse({
    status,
    body: { success: false, message, data: null, errors: [message] }
  });
}

/**
 * Generic list/create/update/delete simulator for the many simple "named entity" endpoints
 * (categories, brands, tags, product types, coupons, reviews, ...) that all follow the same
 * REST shape: GET base -> list, POST base -> create, PUT base/:id -> update, DELETE base/:id -> delete.
 * Keeps every one of those handlers to a couple of lines instead of duplicating CRUD boilerplate.
 */
export function simpleCrud<T extends { id: string }>(
  db: DemoDbService,
  collection: string,
  seed: readonly T[],
  basePath: string,
  ctx: DemoRequestContext,
  buildNew: (body: Record<string, unknown>, id: string) => T,
  applyUpdate: (existing: T, body: Record<string, unknown>) => T
): HttpResponse<ApiResponse<unknown>> | null {
  if (!ctx.path.startsWith(basePath)) return null;

  const rest = ctx.path.slice(basePath.length).replace(/^\//, '');
  const id = rest || null;
  const key = tenantCollection(collection, ctx);
  const items = db.getAll<T>(key, tenantSeed(seed, ctx));

  if (ctx.method === 'GET' && !id) {
    return ok(items);
  }
  if (ctx.method === 'POST' && !id) {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const entity = buildNew(body, db.newId());
    items.push(entity);
    db.saveAll(key, items);
    return created(entity);
  }
  if ((ctx.method === 'PUT' || ctx.method === 'PATCH') && id) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return fail('Not found', 404);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    items[idx] = applyUpdate(items[idx], body);
    db.saveAll(key, items);
    return ok(items[idx]);
  }
  if (ctx.method === 'DELETE' && id) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return fail('Not found', 404);
    items.splice(idx, 1);
    db.saveAll(key, items);
    return ok(null, 'Deleted');
  }

  return fail(`Unsupported ${ctx.method} ${ctx.path} in demo mode`, 405);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
