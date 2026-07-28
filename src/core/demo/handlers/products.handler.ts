import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { collectionForTenant, DemoRequestContext, fail, ok, seedForTenant, slugify, tenantCollection, tenantSeed } from '../generic-crud';
import { resolveDocumentUrl } from './documents.handler';
import { getFlatCategories } from './catalog.handler';
import productsSeed from '@mock-data/products.json';
import brandsSeed from '@mock-data/brands.json';
import productTypesSeed from '@mock-data/product-types.json';

interface Variant {
  id: string; sku: string; price: number; compareAtPrice: number | null;
  barcode: string | null; weight: number | null; isActive: boolean; attributes: Record<string, string>;
}
interface ImageDto { id: string; documentId: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean; }
interface InventoryItem {
  id: string; productId: string; variantId?: string | null; variantSku?: string | null;
  quantityAvailable: number; quantityReserved: number; lowStockThreshold: number;
}
export interface ProductRecord {
  id: string; tenantId: string;
  categoryId: string; categoryName: string;
  brandId: string | null; brandName: string | null;
  productTypeId: string; productTypeName: string;
  name: string; slug: string;
  shortDescription: string | null; description: string | null;
  metaTitle: string | null; metaDescription: string | null;
  sku: string; price: number; compareAtPrice: number | null; costPrice: number | null;
  weight: number | null; trackInventory: boolean; isNew: boolean; displayOrder: number; status: number;
  variants: Variant[]; images: ImageDto[]; tagIds: string[]; inventory: InventoryItem[];
  isFeatured?: boolean;
}
interface NamedEntity { id: string; name: string }

const PRODUCTS = 'products';

/** Read-only, raw-tenantId accessor for a tenant's products — used by the public storefront
 * catalog handler, which resolves a tenant from a store slug rather than from ctx.tenantId. */
export function getTenantProducts(db: DemoDbService, tenantId: string | null): ProductRecord[] {
  return db.getAll<ProductRecord>(
    collectionForTenant(PRODUCTS, tenantId),
    seedForTenant(productsSeed as unknown as ProductRecord[], tenantId)
  );
}

function lookupName(db: DemoDbService, ctx: DemoRequestContext, kind: 'category' | 'brand' | 'productType', id: string | null): string | null {
  if (!id) return null;
  if (kind === 'category') {
    return getFlatCategories(db, ctx).find((c) => c.id === id)?.name ?? null;
  }
  if (kind === 'brand') {
    return db.getAll<NamedEntity>(tenantCollection('brands', ctx), tenantSeed(brandsSeed as NamedEntity[], ctx)).find((b) => b.id === id)?.name ?? null;
  }
  return db.getAll<NamedEntity>(tenantCollection('productTypes', ctx), tenantSeed(productTypesSeed as NamedEntity[], ctx)).find((t) => t.id === id)?.name ?? null;
}

function toListItem(p: ProductRecord) {
  const primary = p.images.find((i) => i.isPrimary) ?? p.images[0];
  return {
    id: p.id, name: p.name, slug: p.slug, sku: p.sku, price: p.price, status: p.status,
    categoryId: p.categoryId, categoryName: p.categoryName,
    brandId: p.brandId, brandName: p.brandName,
    productTypeId: p.productTypeId, productTypeName: p.productTypeName,
    isNew: p.isNew, displayOrder: p.displayOrder,
    primaryImageUrl: primary?.url ?? null,
    variantCount: p.variants.length,
    isFeatured: p.isFeatured ?? false
  };
}

// eslint-disable-next-line complexity
export function handleProducts(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  if (!ctx.path.startsWith('/products')) return null;

  const productsKey = tenantCollection(PRODUCTS, ctx);
  const products = () => db.getAll<ProductRecord>(productsKey, tenantSeed(productsSeed as unknown as ProductRecord[], ctx));
  const persist = (list: ProductRecord[]) => db.saveAll(productsKey, list);

  // /products/status (bulk) must be matched before the generic /products/:id branch below.
  if (ctx.method === 'PUT' && ctx.path === '/products/status') {
    const body = (ctx.body ?? {}) as { productIds: string[]; status: number };
    const list = products();
    let successCount = 0;
    const failures: Array<{ productId: string; error: string }> = [];
    for (const id of body.productIds) {
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) { failures.push({ productId: id, error: 'Not found' }); continue; }
      list[idx] = { ...list[idx], status: body.status };
      successCount++;
    }
    persist(list);
    return ok({ successCount, failureCount: failures.length, failures });
  }

  if (ctx.method === 'GET' && ctx.path === '/products') {
    const q = ctx.query;
    let items = products();
    const categoryId = q.get('categoryId');
    const brandId = q.get('brandId');
    const tagId = q.get('tagId');
    const status = q.get('status');
    const search = q.get('search')?.toLowerCase();
    if (categoryId) items = items.filter((p) => p.categoryId === categoryId);
    if (brandId) items = items.filter((p) => p.brandId === brandId);
    if (tagId) items = items.filter((p) => p.tagIds.includes(tagId));
    if (status) items = items.filter((p) => String(p.status) === status);
    if (search) items = items.filter((p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));

    const page = Number(q.get('page') ?? '1');
    const pageSize = Number(q.get('pageSize') ?? '20');
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    return ok({ items: pageItems.map(toListItem), totalCount: items.length, page, pageSize });
  }

  if (ctx.method === 'POST' && ctx.path === '/products') {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const list = products();
    const id = db.newId();
    const name = String(body['name'] ?? 'Untitled product');
    const record: ProductRecord = {
      id, tenantId: String(body['tenantId'] ?? ''),
      categoryId: String(body['categoryId'] ?? ''),
      categoryName: lookupName(db, ctx, 'category', String(body['categoryId'] ?? '')) ?? '',
      brandId: (body['brandId'] as string) ?? null,
      brandName: lookupName(db, ctx, 'brand', (body['brandId'] as string) ?? null),
      productTypeId: String(body['productTypeId'] ?? ''),
      productTypeName: lookupName(db, ctx, 'productType', String(body['productTypeId'] ?? '')) ?? '',
      name, slug: `${slugify(name)}-${id.slice(0, 6)}`,
      shortDescription: (body['shortDescription'] as string) ?? null,
      description: (body['description'] as string) ?? null,
      metaTitle: (body['metaTitle'] as string) ?? null,
      metaDescription: (body['metaDescription'] as string) ?? null,
      sku: String(body['sku'] ?? `SKU-${id.slice(0, 8).toUpperCase()}`),
      price: Number(body['price'] ?? 0),
      compareAtPrice: (body['compareAtPrice'] as number) ?? null,
      costPrice: (body['costPrice'] as number) ?? null,
      weight: (body['weight'] as number) ?? null,
      trackInventory: Boolean(body['trackInventory'] ?? true),
      isNew: Boolean(body['isNew'] ?? false),
      displayOrder: Number(body['displayOrder'] ?? 0),
      status: Number(body['status'] ?? 1),
      variants: [], images: [], tagIds: [], inventory: [], isFeatured: false
    };
    list.push(record);
    persist(list);
    return ok(record, 'Product created');
  }

  // ----- sub-resources on /products/:id/... -----
  const subMatch = ctx.path.match(/^\/products\/([^/]+)\/(variants|inventory|images|tags|featured|status)(?:\/([^/]+))?$/);
  if (subMatch) {
    const [, productId, resource, subId] = subMatch;
    const list = products();
    const idx = list.findIndex((p) => p.id === productId);
    if (idx === -1) return fail('Product not found', 404);
    const product = { ...list[idx] };

    if (resource === 'status' && ctx.method === 'PATCH') {
      const body = (ctx.body ?? {}) as { status: number };
      product.status = body.status;
      list[idx] = product; persist(list);
      return ok(product);
    }

    if (resource === 'featured' && ctx.method === 'PUT') {
      product.isFeatured = !product.isFeatured;
      list[idx] = product; persist(list);
      return ok({ productId, isFeatured: product.isFeatured });
    }

    if (resource === 'tags' && ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as { tagIds: string[] };
      product.tagIds = body.tagIds ?? [];
      list[idx] = product; persist(list);
      return ok(product);
    }

    if (resource === 'images' && ctx.method === 'PUT') {
      const body = (ctx.body ?? {}) as { images: Array<{ id: string | null; documentId: string; altText: string | null; sortOrder: number; isPrimary: boolean }> };
      product.images = (body.images ?? []).map((img) => ({
        id: img.id ?? db.newId(),
        documentId: img.documentId,
        url: resolveDocumentUrl(db, img.documentId) ?? '',
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary
      }));
      list[idx] = product; persist(list);
      return ok(product);
    }

    if (resource === 'variants') {
      if (ctx.method === 'POST') {
        const body = (ctx.body ?? {}) as Omit<Variant, 'id' | 'sku'> & { tenantId: string };
        const variant: Variant = {
          id: db.newId(), sku: `${product.sku}-${(product.variants.length + 1).toString().padStart(2, '0')}`,
          price: body.price, compareAtPrice: body.compareAtPrice ?? null, barcode: body.barcode ?? null,
          weight: body.weight ?? null, isActive: body.isActive, attributes: body.attributes ?? {}
        };
        product.variants = [...product.variants, variant];
        list[idx] = product; persist(list);
        return ok(variant, 'Variant created');
      }
      if (ctx.method === 'PUT' && subId) {
        const body = (ctx.body ?? {}) as Partial<Variant>;
        product.variants = product.variants.map((v) => (v.id === subId ? { ...v, ...body } : v));
        list[idx] = product; persist(list);
        return ok(product.variants.find((v) => v.id === subId));
      }
      if (ctx.method === 'DELETE' && subId) {
        product.variants = product.variants.filter((v) => v.id !== subId);
        product.inventory = product.inventory.filter((i) => i.variantId !== subId);
        list[idx] = product; persist(list);
        return ok(true, 'Variant deleted');
      }
    }

    if (resource === 'inventory') {
      if (ctx.method === 'GET' && !subId) {
        return ok(product.inventory);
      }
      if (ctx.method === 'POST') {
        const body = (ctx.body ?? {}) as { variantId: string | null; quantityAvailable: number; lowStockThreshold: number };
        const variantSku = body.variantId ? product.variants.find((v) => v.id === body.variantId)?.sku ?? null : null;
        const item: InventoryItem = {
          id: db.newId(), productId, variantId: body.variantId, variantSku,
          quantityAvailable: body.quantityAvailable, quantityReserved: 0, lowStockThreshold: body.lowStockThreshold
        };
        product.inventory = [...product.inventory, item];
        list[idx] = product; persist(list);
        return ok(item, 'Inventory created');
      }
      if (ctx.method === 'PUT' && subId) {
        const body = (ctx.body ?? {}) as { quantityAvailable: number; lowStockThreshold: number };
        product.inventory = product.inventory.map((i) => (i.id === subId ? { ...i, ...body } : i));
        list[idx] = product; persist(list);
        return ok(product.inventory.find((i) => i.id === subId));
      }
      if (ctx.method === 'DELETE' && subId) {
        product.inventory = product.inventory.filter((i) => i.id !== subId);
        list[idx] = product; persist(list);
        return ok(true, 'Inventory deleted');
      }
    }
  }

  // ----- /products/:id (get / update / delete) -----
  const idMatch = ctx.path.match(/^\/products\/([^/]+)$/);
  if (idMatch) {
    const productId = idMatch[1];
    const list = products();
    const idx = list.findIndex((p) => p.id === productId);

    if (ctx.method === 'GET') {
      if (idx === -1) return fail('Product not found', 404);
      return ok(list[idx]);
    }
    if (ctx.method === 'PUT') {
      if (idx === -1) return fail('Product not found', 404);
      const body = (ctx.body ?? {}) as Record<string, unknown>;
      const updated: ProductRecord = {
        ...list[idx],
        categoryId: String(body['categoryId'] ?? list[idx].categoryId),
        categoryName: lookupName(db, ctx, 'category', String(body['categoryId'] ?? list[idx].categoryId)) ?? list[idx].categoryName,
        brandId: (body['brandId'] as string) ?? null,
        brandName: lookupName(db, ctx, 'brand', (body['brandId'] as string) ?? null),
        productTypeId: String(body['productTypeId'] ?? list[idx].productTypeId),
        productTypeName: lookupName(db, ctx, 'productType', String(body['productTypeId'] ?? list[idx].productTypeId)) ?? list[idx].productTypeName,
        name: String(body['name'] ?? list[idx].name),
        shortDescription: (body['shortDescription'] as string) ?? null,
        description: (body['description'] as string) ?? null,
        metaTitle: (body['metaTitle'] as string) ?? null,
        metaDescription: (body['metaDescription'] as string) ?? null,
        price: Number(body['price'] ?? list[idx].price),
        compareAtPrice: (body['compareAtPrice'] as number) ?? null,
        costPrice: (body['costPrice'] as number) ?? null,
        weight: (body['weight'] as number) ?? null,
        trackInventory: Boolean(body['trackInventory'] ?? list[idx].trackInventory),
        isNew: Boolean(body['isNew'] ?? list[idx].isNew),
        displayOrder: Number(body['displayOrder'] ?? list[idx].displayOrder),
        status: Number(body['status'] ?? list[idx].status)
      };
      list[idx] = updated;
      persist(list);
      return ok(updated, 'Product updated');
    }
    if (ctx.method === 'DELETE') {
      if (idx === -1) return fail('Product not found', 404);
      list.splice(idx, 1);
      persist(list);
      return ok(null, 'Product deleted');
    }
  }

  return null;
}
