import { Injectable, inject } from '@angular/core';
import { Observable, concatMap, from, of, switchMap, toArray } from 'rxjs';
import { DocumentUploadService } from '@features/admin/data-access/document-upload.service';
import { FileCategory } from '@shared/models/enums/file-category.enum';
import { documentIdFromUpload } from '@shared/models/dto/uploaded-document.dto';
import { ProductStatus } from '../models/product-status.enum';
import {
  PendingImageUpload,
  ProductDetailDto,
  ProductSavePayload,
  SaveProductImageItem,
  SaveProductRequest
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

        if (payload.variants.length > 0) {
          chain$ = chain$.pipe(
            switchMap(() =>
              from(payload.variants).pipe(
                concatMap((variant) =>
                  this.productApi.createVariant(productId, {
                    tenantId,
                    price: variant.price,
                    compareAtPrice: variant.compareAtPrice,
                    barcode: variant.barcode,
                    weight: variant.weight,
                    isActive: variant.isActive,
                    attributes: variant.attributes
                  })
                ),
                toArray(),
                switchMap((createdVariants) => {
                  const variantIdMap = new Map<string, string>();
                  payload.variants.forEach((source, index) => {
                    variantIdMap.set(source.sourceVariantId, createdVariants[index].id);
                  });

                  if (!payload.core.trackInventory || payload.inventory.length === 0) {
                    return this.productApi.get(productId, tenantId);
                  }

                  return from(payload.inventory).pipe(
                    concatMap((item) =>
                      this.productApi.createInventory(productId, {
                        tenantId,
                        variantId: item.sourceVariantId
                          ? (variantIdMap.get(item.sourceVariantId) ?? null)
                          : null,
                        quantityAvailable: item.quantityAvailable,
                        lowStockThreshold: item.lowStockThreshold
                      })
                    ),
                    toArray(),
                    switchMap(() => this.productApi.get(productId, tenantId))
                  );
                })
              )
            )
          );
        } else if (payload.core.trackInventory && payload.inventory.length > 0) {
          chain$ = chain$.pipe(
            switchMap(() =>
              from(payload.inventory).pipe(
                concatMap((item) =>
                  this.productApi.createInventory(productId, {
                    tenantId,
                    variantId: null,
                    quantityAvailable: item.quantityAvailable,
                    lowStockThreshold: item.lowStockThreshold
                  })
                ),
                toArray(),
                switchMap(() => this.productApi.get(productId, tenantId))
              )
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
              this.productApi
                .saveImages(productId, { tenantId, images: payload.existingImages })
                .pipe(switchMap(() => this.productApi.get(productId, tenantId)))
            )
          );
        }

        chain$ = chain$.pipe(
          switchMap(() =>
            this.productApi
              .saveTags(productId, { tenantId, tagIds: payload.tagIds })
              .pipe(switchMap(() => this.productApi.get(productId, tenantId)))
          )
        );

        if (payload.publish) {
          chain$ = chain$.pipe(
            switchMap(() =>
              this.productApi
                .patchStatus(productId, { tenantId, status: ProductStatus.Active })
                .pipe(switchMap(() => this.productApi.get(productId, tenantId)))
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
