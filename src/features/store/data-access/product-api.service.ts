import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import {
  CatalogProductDetailDto,
  CatalogProductListItemDto
} from '@features/catalog/models/catalog-storefront.model';
import {
  ProductListFilters,
  ProductListResult,
  ProductSortOption,
  StoreProduct
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly catalogApi = inject(CatalogStorefrontApiService);

  listByStore(storeSlug: string, filters: ProductListFilters = {}): Observable<ProductListResult> {
    return forkJoin({
      products: this.catalogApi.listProducts(storeSlug, {
        categorySlug: filters.category || filters.categorySlug,
        brandSlug: filters.brand || filters.brandSlug,
        tagSlug: filters.tagSlug,
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 12
      }),
      categories: this.catalogApi.listCategories(storeSlug),
      brands: this.catalogApi.listBrands(storeSlug)
    }).pipe(
      map(({ products, categories, brands }) => {
        let items = [...products.items];

        if (filters.search?.trim()) {
          const q = filters.search.trim().toLowerCase();
          items = items.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.shortDescription?.toLowerCase().includes(q) ?? false)
          );
        }
        if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
        if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);
        if (filters.onSale) {
          items = items.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price);
        }

        items = this.sortProducts(items, filters.sort);

        const categoryNames = this.flattenCategoryNames(categories);
        const brandNames = brands.map((b) => b.name).sort();

        const page = filters.page ?? 1;
        const pageSize = filters.pageSize ?? 12;
        const start = (page - 1) * pageSize;
        const paged = items.slice(start, start + pageSize);

        return {
          items: paged,
          total: items.length,
          page,
          pageSize,
          categories: categoryNames,
          brands: brandNames
        };
      })
    );
  }

  getFeatured(storeSlug: string, limit = 6): Observable<StoreProduct[]> {
    return this.catalogApi
      .listProducts(storeSlug, { page: 1, pageSize: limit })
      .pipe(map((r) => r.items.slice(0, limit)));
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
    const q = query.trim().toLowerCase();
    if (!q) return of([]);
    return this.catalogApi.listProducts(storeSlug, { pageSize: 50 }).pipe(
      map((r) =>
        r.items
          .filter((p) => p.name.toLowerCase().includes(q))
          .map((p) => p.name)
          .slice(0, 8)
      )
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

  private sortProducts(
    items: CatalogProductListItemDto[],
    sort?: ProductSortOption
  ): CatalogProductListItemDto[] {
    const list = [...items];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'newest':
        return list;
      case 'rating':
      case 'reviews':
      case 'popular':
      default:
        return list;
    }
  }
}
