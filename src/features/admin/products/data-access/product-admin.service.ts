import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { productCatalogStore } from '../../../store/data-access/product-catalog.store';
import { ProductListFilters, ProductListResult, StoreProduct } from '../../../store/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductAdminService {
  list(filters: ProductListFilters = {}): Observable<ProductListResult> {
    let items = productCatalogStore.getAll();

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filters.category) items = items.filter((p) => p.category === filters.category);
    if (filters.status) items = items.filter((p) => p.status === filters.status);
    if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);

    items.sort((a, b) => a.name.localeCompare(b.name));

    const categories = [...new Set(productCatalogStore.getAll().map((p) => p.category))].sort();
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const start = (page - 1) * pageSize;

    return of({
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
      categories,
      brands: [...new Set(items.map((p) => p.brand))].sort()
    }).pipe(delay(200));
  }

  getById(id: string): Observable<StoreProduct | null> {
    return of(productCatalogStore.getById(id) ?? null).pipe(delay(100));
  }

  save(product: StoreProduct): Observable<StoreProduct> {
    const saved = productCatalogStore.upsert({
      ...product,
      createdAt: product.createdAt ?? new Date().toISOString()
    });
    return of(saved).pipe(delay(250));
  }

  delete(id: string): Observable<boolean> {
    return of(productCatalogStore.delete(id)).pipe(delay(200));
  }

  duplicate(id: string): Observable<StoreProduct | null> {
    return of(productCatalogStore.duplicate(id)).pipe(delay(200));
  }

  bulkUpdateStatus(ids: string[], status: StoreProduct['status']): Observable<number> {
    let count = 0;
    for (const id of ids) {
      const p = productCatalogStore.getById(id);
      if (p) {
        productCatalogStore.upsert({ ...p, status });
        count++;
      }
    }
    return of(count).pipe(delay(200));
  }
}
