import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { CategoryAdminService } from '../../data-access/category-admin.service';
import { BrandAdminService } from '../../data-access/brand-admin.service';
import { ProductTagApiService } from '@features/catalog/data-access/product-tag-api.service';
import { ProductAttributeApiService } from '@features/catalog/data-access/product-attribute-api.service';
import { ProductAdminService } from './product-admin.service';
import { ProductDetailDto } from '@features/catalog/models/product-admin.model';
import { ProductCategoryDto } from '@features/catalog/models/product-category.model';
import { BrandDto } from '@features/catalog/models/brand.model';
import { ProductTagDto } from '@features/catalog/models/product-tag.model';
import { ProductAttributeDto } from '@features/catalog/models/product-attribute.model';
import { getApiErrorMessage } from '@shared/utils/api-error.util';

export type ProductFormSection = 'details' | 'tags' | 'images' | 'variants' | 'inventory';

@Injectable()
export class ProductFormStateService {
  private readonly productApi = inject(ProductAdminService);
  private readonly categoryApi = inject(CategoryAdminService);
  private readonly brandApi = inject(BrandAdminService);
  private readonly tagApi = inject(ProductTagApiService);
  private readonly attributeApi = inject(ProductAttributeApiService);

  readonly product = signal<ProductDetailDto | null>(null);
  readonly productId = signal('');
  readonly isNew = signal(true);
  readonly loading = signal(false);
  readonly referenceLoading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly categories = signal<ProductCategoryDto[]>([]);
  readonly brands = signal<BrandDto[]>([]);
  readonly tags = signal<ProductTagDto[]>([]);
  readonly attributes = signal<ProductAttributeDto[]>([]);
  readonly sectionSaving = signal<Record<ProductFormSection, boolean>>({
    details: false,
    tags: false,
    images: false,
    variants: false,
    inventory: false
  });
  readonly sectionSavedAt = signal<Partial<Record<ProductFormSection, Date>>>({});
  readonly sectionsEnabled = signal(false);

  /** Product + reference lists both loaded — safe to render section forms. */
  readonly pageReady = computed(() => !this.loading() && !this.referenceLoading());

  initNew(): void {
    this.isNew.set(true);
    this.productId.set('');
    this.product.set(null);
    this.sectionsEnabled.set(false);
    this.loading.set(false);
    this.loadError.set(null);
    this.loadReferenceData();
  }

  initEdit(id: string): void {
    this.isNew.set(false);
    this.productId.set(id);
    this.product.set(null);
    this.sectionsEnabled.set(true);
    this.loadError.set(null);
    this.loadReferenceData();
    this.loadProduct(id);
  }

  loadReferenceData(): void {
    this.referenceLoading.set(true);
    forkJoin({
      categories: this.categoryApi.listFlat(),
      brands: this.brandApi.list(),
      tags: this.tagApi.list(),
      attributes: this.attributeApi.list()
    }).subscribe({
      next: ({ categories, brands, tags, attributes }) => {
        this.categories.set(categories);
        this.brands.set(brands);
        this.tags.set(tags);
        this.attributes.set(attributes);
        this.referenceLoading.set(false);
      },
      error: () => {
        this.referenceLoading.set(false);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.productApi.getById(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.productId.set(p?.id ?? id);
        this.loading.set(false);
      },
      error: (err) => {
        this.loadError.set(getApiErrorMessage(err, 'Could not load product'));
        this.loading.set(false);
      }
    });
  }

  reload(): Observable<ProductDetailDto | null> {
    const id = this.productId();
    if (!id) {
      return new Observable((s) => {
        s.next(null);
        s.complete();
      });
    }
    return this.productApi.getById(id).pipe(
      tap((p) => {
        this.product.set(p);
        if (p) this.productId.set(p.id);
      })
    );
  }

  onProductCreated(product: ProductDetailDto): void {
    this.product.set(product);
    this.productId.set(product.id);
    this.isNew.set(false);
    this.sectionsEnabled.set(true);
  }

  mergeProduct(product: ProductDetailDto): void {
    this.product.set(product);
    this.productId.set(product.id);
  }

  setSectionSaving(section: ProductFormSection, saving: boolean): void {
    this.sectionSaving.update((m) => ({ ...m, [section]: saving }));
  }

  markSectionSaved(section: ProductFormSection): void {
    this.sectionSavedAt.update((m) => ({ ...m, [section]: new Date() }));
  }

  sectionLastSaved(section: ProductFormSection): Date | null {
    return this.sectionSavedAt()[section] ?? null;
  }

  isSectionSaving(section: ProductFormSection): boolean {
    return this.sectionSaving()[section];
  }
}
