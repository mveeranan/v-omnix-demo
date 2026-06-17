import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { categoryStore } from './category.store';
import { ProductCategoryDto, createEmptyProductCategory } from '../models/product-category.model';
import { productCatalogStore } from '../../store/data-access/product-catalog.store';

@Injectable({ providedIn: 'root' })
export class CategoryAdminService {
  list(): Observable<ProductCategoryDto[]> {
    return of(categoryStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<ProductCategoryDto | null> {
    return of(categoryStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<ProductCategoryDto, 'id'>): Observable<ProductCategoryDto> {
    return of(categoryStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<ProductCategoryDto>): Observable<ProductCategoryDto> {
    const updated = categoryStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    const productsUsing = productCatalogStore.getAll().filter((p) => p.categoryId === id);
    if (productsUsing.length > 0) {
      return throwError(() => new Error('HAS_PRODUCTS'));
    }
    categoryStore.delete(id);
    return of(undefined).pipe(delay(200));
  }

  createEmpty(tenantId = 'default'): Omit<ProductCategoryDto, 'id'> {
    return createEmptyProductCategory(tenantId);
  }
}
