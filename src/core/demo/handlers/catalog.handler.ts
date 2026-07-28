import { HttpResponse } from '@angular/common/http';
import { DemoDbService } from '../demo-db.service';
import { collectionForTenant, DemoRequestContext, ok, seedForTenant, simpleCrud, slugify, tenantCollection, tenantSeed } from '../generic-crud';
import categoriesSeed from '@mock-data/categories.json';
import brandsSeed from '@mock-data/brands.json';
import tagsSeed from '@mock-data/product-tags.json';
import productTypesSeed from '@mock-data/product-types.json';

export interface CategoryNode {
  id: string; tenantId: string; name: string; slug: string; description: string | null;
  parentCategoryId: string | null; displayOrder: number; isActive: boolean;
  imageDocumentId: string | null; imageDocumentUrl: string | null;
}
export interface Brand { id: string; tenantId: string; name: string; slug: string; description: string | null; isActive: boolean }
export interface Tag { id: string; tenantId: string; name: string; slug: string; isActive: boolean }
interface ProductTypeAttr { id: string; name: string; dataType: number; isRequired: boolean; displayOrder: number; possibleValues: string[] }
interface ProductType { id: string; tenantId: string; name: string; description: string | null; attributes: ProductTypeAttr[] }

const CATEGORIES = 'categories';

function flattenSeed(): CategoryNode[] {
  interface RawNode extends CategoryNode { children?: RawNode[] }
  const out: CategoryNode[] = [];
  const walk = (nodes: RawNode[]) => nodes.forEach(({ children, ...rest }) => { out.push(rest); if (children?.length) walk(children); });
  walk(categoriesSeed as RawNode[]);
  return out;
}

/** Canonical, always-flat read of the categories collection — the only function anything
 * outside this file should use to read categories, so there is exactly one shape in storage
 * regardless of which handler happens to touch the collection first. Tenant-scoped: only the
 * default demo tenant gets the hand-authored seed, every other tenant starts empty. */
export function getFlatCategories(db: DemoDbService, ctx: DemoRequestContext): CategoryNode[] {
  return db.getAll<CategoryNode>(tenantCollection(CATEGORIES, ctx), tenantSeed(flattenSeed(), ctx));
}

/** Raw-tenantId variants for the public storefront catalog handler (resolves a tenant from a
 * store slug rather than ctx.tenantId — an anonymous shopper isn't "logged in" as that tenant). */
export function getFlatCategoriesForTenant(db: DemoDbService, tenantId: string | null): CategoryNode[] {
  return db.getAll<CategoryNode>(collectionForTenant(CATEGORIES, tenantId), seedForTenant(flattenSeed(), tenantId));
}
export function getBrandsForTenant(db: DemoDbService, tenantId: string | null): Brand[] {
  return db.getAll<Brand>(collectionForTenant('brands', tenantId), seedForTenant(brandsSeed as Brand[], tenantId));
}
export function getTagsForTenant(db: DemoDbService, tenantId: string | null): Tag[] {
  return db.getAll<Tag>(collectionForTenant('productTags', tenantId), seedForTenant(tagsSeed as Tag[], tenantId));
}

function toTree(flat: CategoryNode[]): unknown[] {
  const byId = new Map(flat.map((c) => [c.id, { ...c, children: [] as unknown[] }]));
  const roots: unknown[] = [];
  for (const node of byId.values()) {
    if (node.parentCategoryId && byId.has(node.parentCategoryId)) {
      (byId.get(node.parentCategoryId) as { children: unknown[] }).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function handleCatalogTaxonomy(db: DemoDbService, ctx: DemoRequestContext): HttpResponse<unknown> | null {
  // Categories: stored flat, returned as a tree (mirrors the real API's shape).
  if (ctx.path.startsWith('/product-categories')) {
    const rest = ctx.path.slice('/product-categories'.length).replace(/^\//, '');
    const id = rest || null;
    const categoriesKey = tenantCollection(CATEGORIES, ctx);
    const flat = getFlatCategories(db, ctx);

    if (ctx.method === 'GET' && !id) return ok(toTree(flat));

    if (ctx.method === 'POST' && !id) {
      const body = (ctx.body ?? {}) as Record<string, unknown>;
      const name = String(body['name'] ?? '');
      const entity: CategoryNode = {
        id: db.newId(), tenantId: String(body['tenantId'] ?? ''), name, slug: slugify(name),
        description: (body['description'] as string) ?? null,
        parentCategoryId: (body['parentCategoryId'] as string) ?? null,
        displayOrder: Number(body['displayOrder'] ?? 0), isActive: Boolean(body['isActive'] ?? true),
        imageDocumentId: null, imageDocumentUrl: null
      };
      flat.push(entity);
      db.saveAll(categoriesKey, flat);
      return ok(entity, 'Category created');
    }
    if ((ctx.method === 'PUT' || ctx.method === 'PATCH') && id) {
      const idx = flat.findIndex((c) => c.id === id);
      if (idx === -1) return ok(null, 'Not found');
      const body = (ctx.body ?? {}) as Record<string, unknown>;
      flat[idx] = {
        ...flat[idx],
        name: String(body['name'] ?? flat[idx].name),
        description: (body['description'] as string) ?? null,
        parentCategoryId: (body['parentCategoryId'] as string) ?? null,
        displayOrder: Number(body['displayOrder'] ?? flat[idx].displayOrder),
        isActive: Boolean(body['isActive'] ?? flat[idx].isActive)
      };
      db.saveAll(categoriesKey, flat);
      return ok(flat[idx], 'Category updated');
    }
    if (ctx.method === 'DELETE' && id) {
      const next = flat.filter((c) => c.id !== id && c.parentCategoryId !== id);
      db.saveAll(categoriesKey, next);
      return ok(null, 'Deleted');
    }
  }

  const brandResp = simpleCrud<Brand>(
    db, 'brands', brandsSeed as Brand[], '/brands', ctx,
    (body, id) => ({ id, tenantId: String(body['tenantId'] ?? ''), name: String(body['name'] ?? ''), slug: slugify(String(body['name'] ?? '')), description: (body['description'] as string) ?? null, isActive: Boolean(body['isActive'] ?? true) }),
    (existing, body) => ({ ...existing, name: String(body['name'] ?? existing.name), description: (body['description'] as string) ?? null, isActive: Boolean(body['isActive'] ?? existing.isActive) })
  );
  if (brandResp) return brandResp;

  const tagResp = simpleCrud<Tag>(
    db, 'productTags', tagsSeed as Tag[], '/product-tags', ctx,
    (body, id) => ({ id, tenantId: String(body['tenantId'] ?? ''), name: String(body['name'] ?? ''), slug: slugify(String(body['name'] ?? '')), isActive: Boolean(body['isActive'] ?? true) }),
    (existing, body) => ({ ...existing, name: String(body['name'] ?? existing.name), isActive: Boolean(body['isActive'] ?? existing.isActive) })
  );
  if (tagResp) return tagResp;

  const typeResp = simpleCrud<ProductType>(
    db, 'productTypes', productTypesSeed as ProductType[], '/product-types', ctx,
    (body, id) => ({ id, tenantId: String(body['tenantId'] ?? ''), name: String(body['name'] ?? ''), description: (body['description'] as string) ?? null, attributes: (body['attributes'] as ProductTypeAttr[]) ?? [] }),
    (existing, body) => ({ ...existing, name: String(body['name'] ?? existing.name), description: (body['description'] as string) ?? null, attributes: (body['attributes'] as ProductTypeAttr[]) ?? existing.attributes })
  );
  if (typeResp) return typeResp;

  return null;
}
