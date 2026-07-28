import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { DemoRequestContext, ok } from '../generic-crud';
import { getTenantProducts, ProductRecord } from './products.handler';
import { getFlatCategoriesForTenant, getBrandsForTenant, getTagsForTenant, CategoryNode } from './catalog.handler';
import { resolveTenantIdOrSlug } from './tenant-site.handler';

const ACTIVE_STATUS = 2;

/**
 * The public storefront (`/catalog/:tenantSlug/...`) resolves a tenant from its store slug and
 * reads that tenant's real, persisted catalog — the old stub always returned an empty list
 * regardless of what products actually existed, so every storefront looked empty. Only
 * `status === Active` products/categories are shown, same as a real storefront would filter.
 *
 * Also note: `listProducts` expects a `PagedResponse<T>` (data is the array directly, with
 * pageNumber/pageSize/totalPages/totalRecords alongside it), not an `ApiResponse<{items,...}>` —
 * the old stub used the wrong envelope shape entirely, which alone would have kept the page empty
 * even if real products had been returned.
 */
function pagedOk<T>(items: T[], page: number, pageSize: number, total: number) {
  return new HttpResponse({
    status: 200,
    body: {
      success: true,
      message: 'OK',
      data: items,
      pageNumber: page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      totalRecords: total
    }
  });
}

function toListItem(p: ProductRecord, tags: Map<string, string>) {
  const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
  return {
    id: p.id, name: p.name, slug: p.slug,
    price: p.price, compareAtPrice: p.compareAtPrice,
    shortDescription: p.shortDescription,
    primaryImageUrl: primary?.url ?? null,
    brandName: p.brandName,
    tags: p.tagIds.map((id) => tags.get(id)).filter((t): t is string => Boolean(t))
  };
}

function toDetail(p: ProductRecord, tags: Map<string, string>) {
  return {
    id: p.id, name: p.name, slug: p.slug,
    shortDescription: p.shortDescription, description: p.description,
    metaTitle: p.metaTitle, metaDescription: p.metaDescription,
    price: p.price, compareAtPrice: p.compareAtPrice, sku: p.sku,
    brandName: p.brandName, categoryName: p.categoryName,
    images: p.images.map((i) => ({ url: i.url, altText: i.altText, sortOrder: i.sortOrder, isPrimary: i.isPrimary })),
    variants: p.variants.map((v) => ({
      id: v.id, sku: v.sku, price: v.price, compareAtPrice: v.compareAtPrice,
      attributes: v.attributes,
      stockAvailable: p.inventory.filter((i) => i.variantId === v.id).reduce((s, i) => s + i.quantityAvailable, 0)
    })),
    tags: p.tagIds.map((id) => tags.get(id)).filter((t): t is string => Boolean(t)),
    trackInventory: p.trackInventory,
    stockAvailable: p.inventory.reduce((s, i) => s + i.quantityAvailable, 0),
    productTypeId: p.productTypeId, productTypeName: p.productTypeName
  };
}

function toTree(flat: CategoryNode[]): unknown[] {
  const active = flat.filter((c) => c.isActive);
  const byId = new Map(active.map((c) => [c.id, { id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageDocumentUrl, children: [] as unknown[] }]));
  const roots: unknown[] = [];
  for (const node of byId.values()) {
    const original = active.find((c) => c.id === node.id)!;
    if (original.parentCategoryId && byId.has(original.parentCategoryId)) {
      (byId.get(original.parentCategoryId) as { children: unknown[] }).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function handleStoreCatalog(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  const match = ctx.path.match(/^\/catalog\/([^/]+)\/(.+)$/);
  if (!match) return null;

  const [, rawSlug, rest] = match;
  const tenantId = resolveTenantIdOrSlug(db, decodeURIComponent(rawSlug));

  if (rest === 'products' && ctx.method === 'GET') {
    if (!tenantId) return pagedOk([], 1, 20, 0);
    const tagNames = new Map(getTagsForTenant(db, tenantId).map((t) => [t.id, t.name]));
    let items = getTenantProducts(db, tenantId).filter((p) => p.status === ACTIVE_STATUS);

    const q = ctx.query;
    const search = q.get('q')?.toLowerCase();
    const categorySlug = q.get('categorySlug');
    const brandSlug = q.get('brandSlug');
    const tagSlug = q.get('tagSlug');
    const minPrice = q.get('minPrice');
    const maxPrice = q.get('maxPrice');
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search));
    if (categorySlug) {
      const categories = getFlatCategoriesForTenant(db, tenantId);
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) items = items.filter((p) => p.categoryId === cat.id);
    }
    if (brandSlug) {
      const brands = getBrandsForTenant(db, tenantId);
      const brand = brands.find((b) => b.slug === brandSlug);
      if (brand) items = items.filter((p) => p.brandId === brand.id);
    }
    if (tagSlug) {
      const tags = getTagsForTenant(db, tenantId);
      const tag = tags.find((t) => t.slug === tagSlug);
      if (tag) items = items.filter((p) => p.tagIds.includes(tag.id));
    }
    if (minPrice) items = items.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) items = items.filter((p) => p.price <= Number(maxPrice));

    const sort = q.get('sort');
    if (sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);
    else if (sort === 'name') items = items.slice().sort((a, b) => a.name.localeCompare(b.name));

    const page = Number(q.get('page') ?? '1');
    const pageSize = Number(q.get('pageSize') ?? '20');
    const start = (page - 1) * pageSize;
    return pagedOk(items.slice(start, start + pageSize).map((p) => toListItem(p, tagNames)), page, pageSize, items.length);
  }

  const productDetailMatch = rest.match(/^products\/([^/]+)$/);
  if (productDetailMatch && ctx.method === 'GET') {
    if (!tenantId) return ok(null);
    const tagNames = new Map(getTagsForTenant(db, tenantId).map((t) => [t.id, t.name]));
    const product = getTenantProducts(db, tenantId).find((p) => p.slug === decodeURIComponent(productDetailMatch[1]) && p.status === ACTIVE_STATUS);
    return product ? ok(toDetail(product, tagNames)) : ok(null);
  }

  if (rest === 'categories' && ctx.method === 'GET') {
    if (!tenantId) return ok([]);
    return ok(toTree(getFlatCategoriesForTenant(db, tenantId)));
  }

  if (rest === 'brands' && ctx.method === 'GET') {
    if (!tenantId) return ok([]);
    const products = getTenantProducts(db, tenantId).filter((p) => p.status === ACTIVE_STATUS);
    const brands = getBrandsForTenant(db, tenantId).filter((b) => b.isActive);
    return ok(brands.map((b) => ({
      id: b.id, name: b.name, slug: b.slug,
      productCount: products.filter((p) => p.brandId === b.id).length
    })));
  }

  if (rest === 'reviews' && ctx.method === 'GET') return ok([]);
  if (rest === 'deal-of-week' && ctx.method === 'GET') return ok({ enabled: false, title: null, badgeText: null, endDateUtc: null, product: null });
  if (rest === 'deals-carousel' && ctx.method === 'GET') return ok({ enabled: false, deals: [] });
  if (rest === 'feedback' && ctx.method === 'GET') return ok([]);
  if (rest === 'newsletter/subscribe' && ctx.method === 'POST') return ok(true, 'Subscribed');

  return null;
}
