import { StoreProduct } from '../models/product.model';
import { BASE_PRODUCTS } from './product.seed';

/** Shared in-memory catalog — storefront and admin read/write the same data. */
class ProductCatalogStore {
  private products: StoreProduct[] = BASE_PRODUCTS.map((p) => structuredClone(p));

  getAll(): StoreProduct[] {
    return this.products.map((p) => structuredClone(p));
  }

  getById(id: string): StoreProduct | undefined {
    const p = this.products.find((x) => x.id === id);
    return p ? structuredClone(p) : undefined;
  }

  getBySlug(slug: string): StoreProduct | undefined {
    const p = this.products.find((x) => x.slug === slug);
    return p ? structuredClone(p) : undefined;
  }

  upsert(product: StoreProduct): StoreProduct {
    const idx = this.products.findIndex((p) => p.id === product.id);
    const next = structuredClone(product);
    if (idx >= 0) this.products[idx] = next;
    else this.products.push(next);
    return structuredClone(next);
  }

  delete(id: string): boolean {
    const before = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < before;
  }

  duplicate(id: string): StoreProduct | null {
    const source = this.products.find((p) => p.id === id);
    if (!source) return null;
    const copy: StoreProduct = {
      ...structuredClone(source),
      id: `p-${Date.now()}`,
      slug: `${source.slug}-copy-${Date.now()}`,
      name: `${source.name} (Copy)`,
      sku: source.sku ? `${source.sku}-COPY` : undefined,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    this.products.push(copy);
    return structuredClone(copy);
  }
}

export const productCatalogStore = new ProductCatalogStore();
