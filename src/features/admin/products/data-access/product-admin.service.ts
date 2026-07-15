import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { ProductAdminApiService } from '@features/catalog/data-access/product-admin-api.service';
import { ProductSaveOrchestrator } from '@features/catalog/data-access/product-save.orchestrator';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  BulkUpdateProductStatusResult,
  CreateInventoryRequest,
  PendingImageUpload,
  ProductDetailDto,
  ProductListFilters,
  ProductListResponse,
  ProductSavePayload,
  SaveProductImageItem,
  SaveProductRequest,
  SaveProductVariantRequest,
  UpdateInventoryRequest
} from '@features/catalog/models/product-admin.model';
import { ProductStatus } from '@features/catalog/models/product-status.enum';

@Injectable({ providedIn: 'root' })
export class ProductAdminService {
  private readonly api = inject(ProductAdminApiService);
  private readonly orchestrator = inject(ProductSaveOrchestrator);
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  private tenantId(): string {
    return requireTenantId(this.auth);
  }

  private refreshProduct(productId: string): Observable<ProductDetailDto> {
    return this.api.get(productId);
  }

  list(filters: ProductListFilters = {}): Observable<ProductListResponse> {
    return this.api.list(filters);
  }

  getById(id: string): Observable<ProductDetailDto | null> {
    return this.api.get(id).pipe(map((p) => p ?? null));
  }

  saveCore(productId: string | undefined, core: SaveProductRequest): Observable<ProductDetailDto> {
    return this.orchestrator.saveCore(productId, core);
  }

  saveTags(productId: string, tagIds: string[]): Observable<ProductDetailDto> {
    return this.orchestrator.saveTags(productId, this.tenantId(), tagIds);
  }

  saveImages(
    productId: string,
    existingImages: SaveProductImageItem[],
    pendingImages: PendingImageUpload[]
  ): Observable<ProductDetailDto> {
    return this.orchestrator.saveImages(productId, this.tenantId(), existingImages, pendingImages);
  }

  createVariant(productId: string, body: Omit<SaveProductVariantRequest, 'tenantId'>): Observable<ProductDetailDto> {
    return this.api
      .createVariant(productId, { ...body, tenantId: this.tenantId() })
      .pipe(switchMap(() => this.refreshProduct(productId)));
  }

  updateVariant(
    productId: string,
    variantId: string,
    body: Omit<SaveProductVariantRequest, 'tenantId'>
  ): Observable<ProductDetailDto> {
    return this.api
      .updateVariant(productId, variantId, { ...body, tenantId: this.tenantId() })
      .pipe(switchMap(() => this.refreshProduct(productId)));
  }

  deleteVariant(productId: string, variantId: string): Observable<ProductDetailDto> {
    return this.api
      .deleteVariant(productId, variantId, { tenantId: this.tenantId() })
      .pipe(switchMap(() => this.refreshProduct(productId)));
  }

  createInventory(
    productId: string,
    body: Omit<CreateInventoryRequest, 'tenantId'>
  ): Observable<ProductDetailDto> {
    return this.api
      .createInventory(productId, { ...body, tenantId: this.tenantId() })
      .pipe(switchMap(() => this.refreshProduct(productId)));
  }

  updateInventory(
    productId: string,
    inventoryId: string,
    body: Omit<UpdateInventoryRequest, 'tenantId'>
  ): Observable<ProductDetailDto> {
    return this.api
      .updateInventory(productId, inventoryId, { ...body, tenantId: this.tenantId() })
      .pipe(switchMap(() => this.refreshProduct(productId)));
  }

  deleteInventory(productId: string, inventoryId: string): Observable<ProductDetailDto> {
    return this.api
      .deleteInventory(productId, inventoryId, { tenantId: this.tenantId() })
      .pipe(switchMap(() => this.refreshProduct(productId)));
  }

  /** @deprecated Use section-specific save methods in the product form. Kept for duplicate flow. */
  save(payload: ProductSavePayload): Observable<ProductDetailDto> {
    return this.orchestrator.save(payload);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }

  duplicate(id: string): Observable<ProductDetailDto | null> {
    const tenantId = requireTenantId(this.auth);
    return this.api.get(id).pipe(
      switchMap((source) => {
        const core: SaveProductRequest = {
          tenantId,
          categoryId: source.categoryId,
          brandId: source.brandId,
          productTypeId: source.productTypeId,
          name: `${source.name} (Copy)`,
          shortDescription: source.shortDescription,
          description: source.description,
          metaTitle: source.metaTitle,
          metaDescription: source.metaDescription,
          price: source.price,
          compareAtPrice: source.compareAtPrice,
          costPrice: source.costPrice,
          weight: source.weight,
          trackInventory: source.trackInventory,
          isNew: source.isNew,
          displayOrder: source.displayOrder,
          status: ProductStatus.Draft
        };
        const payload: ProductSavePayload = {
          core,
          variants: source.variants.map((v) => ({
            sourceVariantId: v.id,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            barcode: v.barcode,
            weight: v.weight,
            isActive: v.isActive,
            attributes: { ...v.attributes }
          })),
          existingImages: [],
          pendingImages: [],
          inventory: source.inventory.map((i) => ({
            sourceVariantId: i.variantId ?? null,
            quantityAvailable: i.quantityAvailable,
            lowStockThreshold: i.lowStockThreshold
          })),
          tagIds: [...source.tagIds],
          publish: false
        };
        return this.orchestrator.save(payload);
      }),
      map((p) => p ?? null)
    );
  }

  bulkUpdateStatus(productIds: string[], status: ProductStatus): Observable<BulkUpdateProductStatusResult> {
    if (productIds.length === 0) {
      return of({ successCount: 0, failureCount: 0, failures: [] });
    }
    return this.api.bulkUpdateStatus({
      tenantId: this.tenantId(),
      productIds,
      status
    });
  }

  toggleFeatured(productId: string): Observable<{ productId: string; isFeatured: boolean }> {
    return this.http
      .put<ApiResponse<{ productId: string; isFeatured: boolean }>>(
        API_ENDPOINTS.products.toggleFeatured(productId),
        { tenantId: this.tenantId(), productId }
      )
      .pipe(
        map((r) => r.data ?? { productId, isFeatured: false })
      );
  }
}
