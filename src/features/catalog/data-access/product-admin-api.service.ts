import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import {
  BulkUpdateProductStatusRequest,
  BulkUpdateProductStatusResult,
  CreateInventoryRequest,
  DeleteInventoryRequest,
  DeleteProductVariantRequest,
  InventoryItemDto,
  PatchProductStatusRequest,
  ProductDetailDto,
  ProductListFilters,
  ProductListResponse,
  ProductVariantDto,
  SaveProductImagesRequest,
  SaveProductRequest,
  SaveProductTagsRequest,
  SaveProductVariantRequest,
  UpdateInventoryRequest
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

  get(id: string): Observable<ProductDetailDto> {
    return this.http
      .get<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.get(id))
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

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(API_ENDPOINTS.products.delete(id))
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

  createVariant(productId: string, body: SaveProductVariantRequest): Observable<ProductVariantDto> {
    return this.http
      .post<ApiResponse<ProductVariantDto>>(API_ENDPOINTS.products.createVariant(productId), body)
      .pipe(map(unwrapApiResponse));
  }

  updateVariant(
    productId: string,
    variantId: string,
    body: SaveProductVariantRequest
  ): Observable<ProductVariantDto> {
    return this.http
      .put<ApiResponse<ProductVariantDto>>(
        API_ENDPOINTS.products.updateVariant(productId, variantId),
        body
      )
      .pipe(map(unwrapApiResponse));
  }

  deleteVariant(
    productId: string,
    variantId: string,
    body: DeleteProductVariantRequest
  ): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(API_ENDPOINTS.products.deleteVariant(productId, variantId), {
        body
      })
      .pipe(map(unwrapApiResponse));
  }

  saveImages(id: string, body: SaveProductImagesRequest): Observable<ProductDetailDto> {
    return this.http
      .put<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.images(id), body)
      .pipe(map(unwrapApiResponse));
  }

  getInventory(id: string): Observable<InventoryItemDto[]> {
    return this.http
      .get<ApiResponse<InventoryItemDto[]>>(API_ENDPOINTS.products.inventory(id))
      .pipe(map(unwrapApiResponse));
  }

  createInventory(productId: string, body: CreateInventoryRequest): Observable<InventoryItemDto> {
    return this.http
      .post<ApiResponse<InventoryItemDto>>(API_ENDPOINTS.products.createInventory(productId), body)
      .pipe(map(unwrapApiResponse));
  }

  updateInventory(
    productId: string,
    inventoryId: string,
    body: UpdateInventoryRequest
  ): Observable<InventoryItemDto> {
    return this.http
      .put<ApiResponse<InventoryItemDto>>(
        API_ENDPOINTS.products.updateInventory(productId, inventoryId),
        body
      )
      .pipe(map(unwrapApiResponse));
  }

  deleteInventory(
    productId: string,
    inventoryId: string,
    body: DeleteInventoryRequest
  ): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(API_ENDPOINTS.products.deleteInventory(productId, inventoryId), {
        body
      })
      .pipe(map(unwrapApiResponse));
  }

  saveTags(id: string, body: SaveProductTagsRequest): Observable<ProductDetailDto> {
    return this.http
      .put<ApiResponse<ProductDetailDto>>(API_ENDPOINTS.products.tags(id), body)
      .pipe(map(unwrapApiResponse));
  }
}
