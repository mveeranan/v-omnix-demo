import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import {
  CatalogProductDetailDto,
  CatalogProductListItemDto
} from '@features/catalog/models/catalog-storefront.model';
import { ProductListFilters, ProductListResult, StoreProduct } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly catalogApi = inject(CatalogStorefrontApiService);

  /**
   * Server-side filtered/sorted/paged product list. Category and brand facet lists are
   * fetched alongside for the shop sidebar — they're independent of the current filters
   * (the full taxonomy is always shown, not just what matches the current query).
   */
  listByStore(storeSlug: string, filters: ProductListFilters = {}): Observable<ProductListResult> {
    return forkJoin({
      products: this.catalogApi.listProducts(storeSlug, {
        categorySlug: filters.category || filters.categorySlug,
        brandSlug: filters.brand || filters.brandSlug,
        tagSlug: filters.tagSlug,
        q: filters.search || filters.q,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        onSale: filters.onSale,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 12
      }),
      categories: this.catalogApi.listCategories(storeSlug),
      brands: this.catalogApi.listBrands(storeSlug)
    }).pipe(
      map(({ products, categories, brands }) => ({
        items: products.items,
        total: products.total,
        page: products.page,
        pageSize: products.pageSize,
        totalPages: products.totalPages,
        categories: this.flattenCategoryNames(categories),
        brands: brands.map((b) => b.name).sort()
      }))
    );
  }

  getFeatured(storeSlug: string, limit = 6): Observable<StoreProduct[]> {
    return this.catalogApi
      .listProducts(storeSlug, { page: 1, pageSize: limit, sort: 'newest' })
      .pipe(map((r) => r.items));
  }

  getBySlug(_storeSlug: string, productSlug: string): Observable<CatalogProductDetailDto | null> {
    return this.catalogApi.getProduct(_storeSlug, productSlug).pipe(map((p) => p ?? null));
  }

  getRelated(
    storeSlug: string,
    product: CatalogProductDetailDto,
    limit = 4
  ): Observable<CatalogProductListItemDto[]> {
    return this.catalogApi
      .listProducts(storeSlug, { pageSize: 50 })
      .pipe(
        map((r) =>
          r.items
            .filter((p) => p.id !== product.id)
            .slice(0, limit)
        )
      );
  }

  searchSuggestions(storeSlug: string, query: string): Observable<string[]> {
    const q = query.trim();
    if (!q) return of([]);
    return this.catalogApi.listProducts(storeSlug, { q, pageSize: 8 }).pipe(
      map((r) => r.items.map((p) => p.name))
    );
  }

  private flattenCategoryNames(
    categories: { name: string; children: { name: string; children: unknown[] }[] }[]
  ): string[] {
    const names: string[] = [];
    const walk = (items: typeof categories) => {
      for (const c of items) {
        names.push(c.name);
        if (c.children?.length) walk(c.children as typeof categories);
      }
    };
    walk(categories);
    return [...new Set(names)].sort();
  }
}
