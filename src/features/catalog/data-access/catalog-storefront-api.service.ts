import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse, PagedResponse } from '@shared/models/api-response.model';
import {
  CatalogBrandDto,
  CatalogCategoryDto,
  CatalogDealOfWeekDto,
  CatalogDealsCarouselDto,
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
      q: filters.q,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      onSale: filters.onSale,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20
    });
    return this.http
      .get<PagedResponse<CatalogProductListItemDto>>(
        `${API_ENDPOINTS.catalog.products(tenantSlug)}${qs}`
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Request failed');
          }
          return {
            items: response.data ?? [],
            total: response.totalRecords,
            page: response.pageNumber,
            pageSize: response.pageSize,
            totalPages: response.totalPages
          } satisfies CatalogProductListResult;
        })
      );
  }

  getDealOfWeek(tenantSlug: string): Observable<CatalogDealOfWeekDto> {
    return this.http
      .get<ApiResponse<CatalogDealOfWeekDto>>(API_ENDPOINTS.catalog.dealOfWeek(tenantSlug))
      .pipe(map(unwrapApiResponse));
  }

  getDealsCarousel(tenantSlug: string): Observable<CatalogDealsCarouselDto> {
    return this.http
      .get<ApiResponse<CatalogDealsCarouselDto>>(API_ENDPOINTS.catalog.dealsCarousel(tenantSlug))
      .pipe(map(unwrapApiResponse));
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
