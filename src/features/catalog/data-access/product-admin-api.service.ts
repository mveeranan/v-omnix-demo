import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import {
  AdjustInventoryRequest,
  BulkUpdateProductStatusRequest,
  BulkUpdateProductStatusResult,
  InventoryItemDto,
  PatchProductStatusRequest,
  ProductDetailDto,
  ProductListFilters,
  ProductListResponse,
  SaveInventoryRequest,
  SaveProductImagesRequest,
  SaveProductRequest,
  SaveProductTagsRequest,
  SaveProductVariantsRequest
} from '../models/product-admin.model';
import { buildQueryString, requireTenantId, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class ProductAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(filters: ProductListFilters = {}): Observable<ProductListResponse> {
    const tenantId = filters.tenantId ?? requireTenantId(this.auth);
    const qs = buildQueryString({
      tenantId,
      status: filters.status,
      categoryId: filters.categoryId,
      brandId: filters.brandId,
      tagId: filters.tagId,
      search: filters.search,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20
    });
    return this.http
      .get<ApiResponse<ProductListResponse>>(`${API_ENDPOINTS.products.list}${qs}`)
      .pipe(map(unwrapApiResponse));
  }

  get(id: string, tenantId?: string): Observable<ProductDetailDto> {
    const tid = tenantId ?? requireTenantId(this.auth);
    return this.http
      .get<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.get(id, tid))
      .pipe(map(unwrapApiResponse));
  }

  create(body: SaveProductRequest): Observable<ProductDetailDto> {
    return this.http
      .post<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.create, body)
      .pipe(map(unwrapApiResponse));
  }

  update(id: string, body: SaveProductRequest): Observable<ProductDetailDto> {
    return this.http
      .put<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.update(id), body)
      .pipe(map(unwrapApiResponse));
  }

  delete(id: string, tenantId?: string): Observable<void> {
    const tid = tenantId ?? requireTenantId(this.auth);
    return this.http
      .delete<ApiResponse<null>>(API_ENDPOINTS.products.delete(id, tid))
      .pipe(map(unwrapApiResponse))
      .pipe(map(() => undefined));
  }

  patchStatus(id: string, body: PatchProductStatusRequest): Observable<ProductDetailDto> {
    return this.http
      .patch<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.patchStatus(id), body)
      .pipe(map(unwrapApiResponse));
  }

  bulkUpdateStatus(body: BulkUpdateProductStatusRequest): Observable<BulkUpdateProductStatusResult> {
    return this.http
      .put<ApiResponse<BulkUpdateProductStatusResult>>(API_ENDPOINTS.products.bulkStatus, body)
      .pipe(map(unwrapApiResponse));
  }

  saveVariants(id: string, body: SaveProductVariantsRequest): Observable<ProductDetailDto> {
    return this.http
      .put<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.variants(id), body)
      .pipe(map(unwrapApiResponse));
  }

  saveImages(id: string, body: SaveProductImagesRequest): Observable<ProductDetailDto> {
    return this.http
      .put<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.images(id), body)
      .pipe(map(unwrapApiResponse));
  }

  getInventory(id: string, tenantId?: string): Observable<InventoryItemDto[]> {
    const tid = tenantId ?? requireTenantId(this.auth);
    return this.http
      .get<ApiResponse<InventoryItemDto[]>>(API_ENDPOINTS.products.inventory(id, tid))
      .pipe(map(unwrapApiResponse));
  }

  saveInventory(id: string, body: SaveInventoryRequest): Observable<InventoryItemDto[]> {
    return this.http
      .put<ApiResponse<InventoryItemDto[]>>(API_ENDPOINTS.products.inventory(id, body.tenantId), body)
      .pipe(map(unwrapApiResponse));
  }

  saveTags(id: string, body: SaveProductTagsRequest): Observable<ProductDetailDto> {
    return this.http
      .put<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.tags(id), body)
      .pipe(map(unwrapApiResponse));
  }
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly http = inject(HttpClient);

  adjust(inventoryId: string, body: AdjustInventoryRequest): Observable<InventoryItemDto> {
    return this.http
      .post<ApiResponse<InventoryItemDto>>(API_ENDPOINTS.inventory.adjust(inventoryId), body)
      .pipe(map(unwrapApiResponse));
  }
}
