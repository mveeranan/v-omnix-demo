import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { DocumentUploadService } from '@features/admin/data-access/document-upload.service';
import { FileCategory } from '@shared/models/enums/file-category.enum';
import { documentIdFromUpload } from '@shared/models/dto/uploaded-document.dto';
import { ProductStatus } from '../models/product-status.enum';
import {
  PendingImageUpload,
  ProductDetailDto,
  ProductSavePayload,
  SaveInventoryItem,
  SaveProductImageItem,
  SaveProductRequest,
  SaveProductVariantItem
} from '../models/product-admin.model';
import { ProductAdminApiService } from './product-admin-api.service';

@Injectable({ providedIn: 'root' })
export class ProductSaveOrchestrator {
  private readonly productApi = inject(ProductAdminApiService);
  private readonly documentUpload = inject(DocumentUploadService);

  saveCore(productId: string | undefined, core: SaveProductRequest): Observable<ProductDetailDto> {
    return productId
      ? this.productApi.update(productId, core)
      : this.productApi.create(core);
  }

  saveTags(productId: string, tenantId: string, tagIds: string[]): Observable<ProductDetailDto> {
    return this.productApi.saveTags(productId, { tenantId, tagIds });
  }

  saveImages(
    productId: string,
    tenantId: string,
    existingImages: SaveProductImageItem[],
    pendingImages: PendingImageUpload[]
  ): Observable<ProductDetailDto> {
    if (pendingImages.length > 0) {
      return this.uploadAndSaveImages(productId, tenantId, existingImages, pendingImages).pipe(
        switchMap(() => this.productApi.get(productId, tenantId))
      );
    }
    return this.productApi.saveImages(productId, { tenantId, images: existingImages }).pipe(
      switchMap(() => this.productApi.get(productId, tenantId))
    );
  }

  saveVariants(
    productId: string,
    tenantId: string,
    selectedAttributeIds: string[],
    variants: SaveProductVariantItem[]
  ): Observable<ProductDetailDto> {
    return this.productApi.saveVariants(productId, {
      tenantId,
      selectedAttributeIds,
      variants: variants.map(({ sku: _sku, ...rest }) => rest)
    });
  }

  saveInventory(
    productId: string,
    tenantId: string,
    items: SaveInventoryItem[]
  ): Observable<ProductDetailDto> {
    return this.productApi
      .saveInventory(productId, { tenantId, items })
      .pipe(switchMap(() => this.productApi.get(productId, tenantId)));
  }

  /** Used only for duplicate-product flow. */
  save(payload: ProductSavePayload): Observable<ProductDetailDto> {
    const tenantId = payload.core.tenantId;
    const isUpdate = !!payload.productId;

    const saveCore$ = isUpdate
      ? this.productApi.update(payload.productId!, payload.core)
      : this.productApi.create(payload.core);

    return saveCore$.pipe(
      switchMap((product) => {
        const productId = product.id;
        let chain$: Observable<ProductDetailDto> = of(product);

        if (payload.variants.length > 0 || payload.selectedAttributeIds.length > 0) {
          chain$ = chain$.pipe(
            switchMap(() =>
              this.productApi.saveVariants(productId, {
                tenantId,
                selectedAttributeIds: payload.selectedAttributeIds,
                variants: payload.variants.map(({ sku: _sku, ...rest }) => rest)
              })
            )
          );
        }

        if (payload.pendingImages.length > 0) {
          chain$ = chain$.pipe(
            switchMap(() =>
              this.uploadAndSaveImages(productId, tenantId, payload.existingImages, payload.pendingImages).pipe(
                switchMap(() => this.productApi.get(productId, tenantId))
              )
            )
          );
        } else if (payload.existingImages.length > 0) {
          chain$ = chain$.pipe(
            switchMap(() =>
              this.productApi.saveImages(productId, {
                tenantId,
                images: payload.existingImages
              })
            )
          );
        }

        if (payload.core.trackInventory && payload.inventory.length > 0) {
          chain$ = chain$.pipe(
            switchMap(() =>
              this.productApi
                .saveInventory(productId, {
                  tenantId,
                  items: payload.inventory
                })
                .pipe(switchMap(() => this.productApi.get(productId, tenantId)))
            )
          );
        }

        chain$ = chain$.pipe(
          switchMap(() =>
            this.productApi.saveTags(productId, {
              tenantId,
              tagIds: payload.tagIds
            })
          )
        );

        if (payload.publish) {
          chain$ = chain$.pipe(
            switchMap(() =>
              this.productApi.patchStatus(productId, {
                tenantId,
                status: ProductStatus.Active
              })
            )
          );
        }

        return chain$;
      })
    );
  }

  private uploadAndSaveImages(
    productId: string,
    tenantId: string,
    existingImages: SaveProductImageItem[],
    pendingImages: PendingImageUpload[]
  ): Observable<ProductDetailDto> {
    const files = pendingImages.map((p) => p.file);
    return this.documentUpload.uploadMany(files, FileCategory.ProductImage, tenantId).pipe(
      switchMap((uploaded) => {
        const newImages: SaveProductImageItem[] = uploaded.map((doc, index) => {
          const pending = pendingImages[index];
          return {
            id: null,
            documentId: documentIdFromUpload(doc),
            altText: pending.altText || null,
            sortOrder: pending.sortOrder,
            isPrimary: pending.isPrimary
          };
        });
        const images = [...existingImages, ...newImages];
        if (!images.some((i) => i.isPrimary) && images.length > 0) {
          images[0] = { ...images[0], isPrimary: true };
        }
        return this.productApi.saveImages(productId, { tenantId, images });
      })
    );
  }
}
