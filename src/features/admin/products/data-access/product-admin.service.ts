import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { ProductAdminApiService } from '@features/catalog/data-access/product-admin-api.service';
import { ProductSaveOrchestrator } from '@features/catalog/data-access/product-save.orchestrator';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import {
  ProductDetailDto,
  ProductListFilters,
  ProductListResponse,
  ProductSavePayload
} from '@features/catalog/models/product-admin.model';
import { ProductStatus } from '@features/catalog/models/product-status.enum';
import { SaveProductRequest } from '@features/catalog/models/product-admin.model';

@Injectable({ providedIn: 'root' })
export class ProductAdminService {
  private readonly api = inject(ProductAdminApiService);
  private readonly orchestrator = inject(ProductSaveOrchestrator);
  private readonly auth = inject(AuthService);

  list(filters: ProductListFilters = {}): Observable<ProductListResponse> {
    return this.api.list(filters);
  }

  getById(id: string): Observable<ProductDetailDto | null> {
    return this.api.get(id).pipe(map((p) => p ?? null));
  }

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
            sku: `${v.sku}-COPY`,
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

  bulkUpdateStatus(ids: string[], status: ProductStatus): Observable<number> {
    const tenantId = requireTenantId(this.auth);
    if (ids.length === 0) return new Observable((s) => { s.next(0); s.complete(); });
    return forkJoin(
      ids.map((id) => this.api.patchStatus(id, { tenantId, status }))
    ).pipe(map((results) => results.length));
  }
}
