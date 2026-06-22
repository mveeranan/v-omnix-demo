import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { ProductCategoryApiService } from '@features/catalog/data-access/product-category-api.service';
import {
  ProductCategoryDto,
  SaveProductCategoryRequest,
  createEmptyProductCategory,
  flattenCategories
} from '@features/catalog/models/product-category.model';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';

@Injectable({ providedIn: 'root' })
export class CategoryAdminService {
  private readonly api = inject(ProductCategoryApiService);
  private readonly auth = inject(AuthService);

  list(): Observable<ProductCategoryDto[]> {
    return this.api.list();
  }

  listFlat(): Observable<ProductCategoryDto[]> {
    return new Observable((subscriber) => {
      this.api.list().subscribe({
        next: (items) => {
          subscriber.next(flattenCategories(items));
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  getById(id: string): Observable<ProductCategoryDto | null> {
    return new Observable((subscriber) => {
      this.listFlat().subscribe({
        next: (items) => {
          subscriber.next(items.find((c) => c.id === id) ?? null);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  create(input: SaveProductCategoryRequest): Observable<ProductCategoryDto> {
    return this.api.create(input);
  }

  update(id: string, patch: SaveProductCategoryRequest): Observable<ProductCategoryDto> {
    return this.api.update(id, patch);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }

  createEmpty(): SaveProductCategoryRequest {
    return createEmptyProductCategory(requireTenantId(this.auth));
  }
}
