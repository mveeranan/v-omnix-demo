import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import {
  CatalogCategoryDto,
  CatalogProductDetailDto,
  CatalogProductListItemDto,
  CatalogSortOption
} from '@features/catalog/models/catalog-storefront.model';
import {
  ProductListFilters,
  ProductListResult,
  ProductSortOption,
  StoreProduct
} from '../models/product.model';

/**
 * Max products fetched per query. Filtering (search / price / category / brand / sort)
 * runs SERVER-SIDE via the catalog endpoint; pagination is client-side within this
 * window so totals stay accurate for small-store catalogs.
 */
const FETCH_WINDOW = 200;

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly catalogApi = inject(CatalogStorefrontApiService);

  listByStore(storeSlug: string, filters: ProductListFilters = {}): Observable<ProductListResult> {
    return forkJoin({
      categories: this.catalogApi.listCategories(storeSlug),
      brands: this.catalogApi.listBrands(storeSlug)
    }).pipe(
      switchMap(({ categories, brands }) => {
        const categoryEntries = this.flattenCategories(categories);
        const brandNames = brands.map((b) => b.name).sort();

        // The filter UI works with display names — translate to slugs for the API.
        const categorySlug =
          filters.categorySlug ||
          (filters.category
            ? categoryEntries.find((c) => c.name === filters.category)?.slug
            : undefined);
        const brandSlug =
          filters.brandSlug ||
          (filters.brand ? brands.find((b) => b.name === filters.brand)?.slug : undefined);

        return this.catalogApi
          .listProducts(storeSlug, {
            categorySlug,
            brandSlug,
            tagSlug: filters.tagSlug,
            q: filters.search?.trim() || undefined,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            sort: this.toServerSort(filters.sort),
            page: 1,
            pageSize: FETCH_WINDOW
          })
          .pipe(
            map((products) => {
              let items = [...products.items];

              // Client-side extras the server doesn't know about yet.
              if (filters.onSale) {
                items = items.filter(
                  (p) => p.compareAtPrice != null && p.compareAtPrice > p.price
                );
              }

              const page = filters.page ?? 1;
              const pageSize = filters.pageSize ?? 12;
              const start = (page - 1) * pageSize;
              const paged = items.slice(start, start + pageSize);

              return {
                items: paged,
                total: items.length,
                page,
                pageSize,
                categories: [...new Set(categoryEntries.map((c) => c.name))].sort(),
                brands: brandNames
              } satisfies ProductListResult;
            })
          );
      })
    );
  }

  getFeatured(storeSlug: string, limit = 6): Observable<StoreProduct[]> {
    return this.catalogApi
      .listProducts(storeSlug, { page: 1, pageSize: limit, sort: 'newest' })
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
      .listProducts(storeSlug, { pageSize: limit + 1, sort: 'newest' })
      .pipe(map((r) => r.items.filter((p) => p.id !== product.id).slice(0, limit)));
  }

  /** Server-side name search for the nav search box / autocomplete. */
  searchSuggestions(storeSlug: string, query: string): Observable<string[]> {
    const q = query.trim();
    if (!q) return of([]);
    return this.catalogApi
      .listProducts(storeSlug, { q, pageSize: 8, sort: 'name' })
      .pipe(map((r) => r.items.map((p) => p.name)));
  }

  private toServerSort(sort?: ProductSortOption): CatalogSortOption | undefined {
    switch (sort) {
      case 'price-asc':
        return 'price-asc';
      case 'price-desc':
        return 'price-desc';
      case 'name':
        return 'name';
      case 'newest':
        return 'newest';
      // rating / reviews / popular need review data — fall back to newest for now
      case 'rating':
      case 'reviews':
      case 'popular':
      default:
        return 'newest';
    }
  }

  private flattenCategories(categories: CatalogCategoryDto[]): { name: string; slug: string }[] {
    const entries: { name: string; slug: string }[] = [];
    const walk = (items: CatalogCategoryDto[]) => {
      for (const c of items) {
        entries.push({ name: c.name, slug: c.slug });
        if (c.children?.length) walk(c.children);
      }
    };
    walk(categories);
    return entries;
  }
}
