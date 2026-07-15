import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import {
  ProductCategoryDto,
  SaveProductCategoryRequest
} from '../models/product-category.model';
import { requireTenantId, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class ProductCategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<ProductCategoryDto[]> {
    return this.http
      .get<ApiResponse<ProductCategoryDto[]>>(API_ENDPOINTS.productCategories.list())
      .pipe(map(unwrapApiResponse));
  }

  create(body: SaveProductCategoryRequest): Observable<ProductCategoryDto> {
    return this.http
      .post<ApiResponse<ProductCategoryDto>>(API_ENDPOINTS.productCategories.create, body)
      .pipe(map(unwrapApiResponse));
  }

  update(id: string, body: SaveProductCategoryRequest): Observable<ProductCategoryDto> {
    return this.http
      .put<ApiResponse<ProductCategoryDto>>(API_ENDPOINTS.productCategories.update(id), body)
      .pipe(map(unwrapApiResponse));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(API_ENDPOINTS.productCategories.delete(id))
      .pipe(map(unwrapApiResponse))
      .pipe(map(() => undefined));
  }
}
