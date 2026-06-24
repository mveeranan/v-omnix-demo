import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { ProductAdminApiService } from '@features/catalog/data-access/product-admin-api.service';
import { ProductSaveOrchestrator } from '@features/catalog/data-access/product-save.orchestrator';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import {
  PendingImageUpload,
  ProductDetailDto,
  ProductListFilters,
  ProductListResponse,
  ProductSavePayload,
  SaveInventoryItem,
  SaveProductImageItem,
  SaveProductRequest,
  SaveProductVariantItem,
  BulkUpdateProductStatusResult
} from '@features/catalog/models/product-admin.model';
import { ProductStatus } from '@features/catalog/models/product-status.enum';

@Injectable({ providedIn: 'root' })
export class ProductAdminService {
  private readonly api = inject(ProductAdminApiService);
  private readonly orchestrator = inject(ProductSaveOrchestrator);
  private readonly auth = inject(AuthService);

  private tenantId(): string {
    return requireTenantId(this.auth);
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

  saveVariants(
    productId: string,
    selectedAttributeIds: string[],
    variants: SaveProductVariantItem[]
  ): Observable<ProductDetailDto> {
    return this.orchestrator.saveVariants(productId, this.tenantId(), selectedAttributeIds, variants);
  }

  saveInventory(productId: string, items: SaveInventoryItem[]): Observable<ProductDetailDto> {
    return this.orchestrator.saveInventory(productId, this.tenantId(), items);
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
    return this.api.get(id, tenantId).pipe(
      switchMap((source) => {
        const core: SaveProductRequest = {
          tenantId,
          categoryId: source.categoryId,
          brandId: source.brandId,
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
          status: ProductStatus.Draft
        };
        const payload: ProductSavePayload = {
          core,
          selectedAttributeIds: [],
          variants: source.variants.map((v) => ({
            id: null,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            barcode: v.barcode,
            weight: v.weight,
            isActive: v.isActive,
            attributes: v.attributes.map((a) => ({
              attributeId: a.attributeId,
              valueId: a.valueId
            }))
          })),
          existingImages: [],
          pendingImages: [],
          inventory: source.inventory.map((i) => ({
            variantId: i.variantId,
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
}
