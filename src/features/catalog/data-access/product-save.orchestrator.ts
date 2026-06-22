import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { DocumentUploadService } from '@features/admin/data-access/document-upload.service';
import { FileCategory } from '@shared/models/enums/file-category.enum';
import { documentIdFromUpload } from '@shared/models/dto/uploaded-document.dto';
import { ProductStatus } from '../models/product-status.enum';
import {
  ProductDetailDto,
  ProductSavePayload,
  SaveProductImageItem
} from '../models/product-admin.model';
import { ProductAdminApiService } from './product-admin-api.service';

@Injectable({ providedIn: 'root' })
export class ProductSaveOrchestrator {
  private readonly productApi = inject(ProductAdminApiService);
  private readonly documentUpload = inject(DocumentUploadService);

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
                variants: payload.variants
              })
            )
          );
        }

        if (payload.pendingImages.length > 0) {
          chain$ = chain$.pipe(
            switchMap((current) =>
              this.uploadAndSaveImages(productId, tenantId, payload, current).pipe(
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
              this.productApi.saveInventory(productId, {
                tenantId,
                items: payload.inventory
              }).pipe(switchMap(() => this.productApi.get(productId, tenantId)))
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
    payload: ProductSavePayload,
    current: ProductDetailDto
  ): Observable<ProductDetailDto> {
    const files = payload.pendingImages.map((p) => p.file);
    return this.documentUpload.uploadMany(files, FileCategory.ProductImage, tenantId).pipe(
      switchMap((uploaded) => {
        const newImages: SaveProductImageItem[] = uploaded.map((doc, index) => {
          const pending = payload.pendingImages[index];
          return {
            id: null,
            documentId: documentIdFromUpload(doc),
            altText: pending.altText || null,
            sortOrder: pending.sortOrder,
            isPrimary: pending.isPrimary
          };
        });
        const images = [...payload.existingImages, ...newImages];
        if (!images.some((i) => i.isPrimary) && images.length > 0) {
          images[0] = { ...images[0], isPrimary: true };
        }
        return this.productApi.saveImages(productId, { tenantId, images });
      })
    );
  }
}
