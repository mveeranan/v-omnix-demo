import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  CatalogBrandDto,
  CatalogCategoryDto,
  CatalogProductDetailDto,
  CatalogProductListFilters,
  CatalogProductListItemDto,
  CatalogProductListResult
} from '../models/catalog-storefront.model';
import { buildQueryString, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class CatalogStorefrontApiService {
  private readonly http = inject(HttpClient);

  listProducts(
    tenantSlug: string,
    filters: CatalogProductListFilters = {}
  ): Observable<CatalogProductListResult> {
    const qs = buildQueryString({
      categorySlug: filters.categorySlug,
      brandSlug: filters.brandSlug,
      tagSlug: filters.tagSlug,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20
    });
    return this.http
      .get<ApiResponse<CatalogProductListItemDto[]>>(
        `${API_ENDPOINTS.catalog.products(tenantSlug)}${qs}`
      )
      .pipe(
        map((response) => {
          const items = unwrapApiResponse(response);
          const page = filters.page ?? 1;
          const pageSize = filters.pageSize ?? 20;
          return {
            items,
            total: items.length,
            page,
            pageSize
          } satisfies CatalogProductListResult;
        })
      );
  }

  getProduct(tenantSlug: string, slug: string): Observable<CatalogProductDetailDto> {
    return this.http
      .get<ApiResponse<CatalogProductDetailDto>>(API_ENDPOINTS.catalog.product(tenantSlug, slug))
      .pipe(map(unwrapApiResponse));
  }

  listCategories(tenantSlug: string): Observable<CatalogCategoryDto[]> {
    return this.http
      .get<ApiResponse<CatalogCategoryDto[]>>(API_ENDPOINTS.catalog.categories(tenantSlug))
      .pipe(map(unwrapApiResponse));
  }

  listBrands(tenantSlug: string): Observable<CatalogBrandDto[]> {
    return this.http
      .get<ApiResponse<CatalogBrandDto[]>>(API_ENDPOINTS.catalog.brands(tenantSlug))
      .pipe(map(unwrapApiResponse));
  }
}
