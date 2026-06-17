import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  ProductListFilters,
  ProductListResult,
  StoreProduct,
  productInStock
} from '../models/product.model';
import { productCatalogStore } from './product-catalog.store';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  listByStore(storeSlug: string, filters: ProductListFilters = {}): Observable<ProductListResult> {
    let items = productCatalogStore.getAll().filter((p) => p.status === 'active');

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.sku?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filters.category) items = items.filter((p) => p.category === filters.category);
    if (filters.brand) items = items.filter((p) => p.brand === filters.brand);
    if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);
    if (filters.inStock) items = items.filter((p) => productInStock(p));
    if (filters.onSale) items = items.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    if (filters.minRating != null) items = items.filter((p) => (p.rating ?? 0) >= filters.minRating!);

    items = this.sortProducts(items, filters.sort);

    const categories = [...new Set(items.map((p) => p.category))].sort();
    const brands = [...new Set(items.map((p) => p.brand))].sort();

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return of({
      items: paged,
      total: items.length,
      page,
      pageSize,
      categories,
      brands
    }).pipe(delay(150));
  }

  getFeatured(storeSlug: string, limit = 6): Observable<StoreProduct[]> {
    const items = productCatalogStore
      .getAll()
      .filter((p) => p.status === 'active' && p.featured)
      .slice(0, limit);
    return of(items).pipe(delay(120));
  }

  getBySlug(_storeSlug: string, productSlug: string): Observable<StoreProduct | null> {
    const p = productCatalogStore.getBySlug(productSlug);
    return of(p && p.status === 'active' ? p : null).pipe(delay(120));
  }

  getRelated(_storeSlug: string, product: StoreProduct, limit = 4): Observable<StoreProduct[]> {
    const items = productCatalogStore
      .getAll()
      .filter((p) => p.status === 'active' && p.id !== product.id && p.category === product.category)
      .slice(0, limit);
    return of(items).pipe(delay(100));
  }

  searchSuggestions(_storeSlug: string, query: string): Observable<string[]> {
    const q = query.trim().toLowerCase();
    if (!q) return of([]);
    const names = productCatalogStore
      .getAll()
      .filter((p) => p.status === 'active' && p.name.toLowerCase().includes(q))
      .map((p) => p.name)
      .slice(0, 8);
    return of(names).pipe(delay(80));
  }

  private sortProducts(items: StoreProduct[], sort?: ProductListFilters['sort']): StoreProduct[] {
    const list = [...items];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'reviews':
        return list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
      case 'newest':
        return list.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
      case 'popular':
      default:
        return list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }
}
