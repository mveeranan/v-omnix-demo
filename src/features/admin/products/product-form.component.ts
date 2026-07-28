import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { productStatusLabel, ProductStatus } from '@features/catalog/models/product-status.enum';
import { ProductFormStateService } from './data-access/product-form-state.service';
import { ProductDetailsSectionComponent } from './sections/product-details-section.component';
import { ProductTagsSectionComponent } from './sections/product-tags-section.component';
import { ProductImagesSectionComponent } from './sections/product-images-section.component';
import { ProductVariantsSectionComponent } from './sections/product-variants-section.component';
import { ProductInventorySectionComponent } from './sections/product-inventory-section.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  providers: [ProductFormStateService],
  styleUrl: './product-form.component.scss',
  imports: [
    RouterLink,
    AdminPageShellComponent,
    AdminStatusBadgeComponent,
    LoadingSpinnerComponent,
    ProductDetailsSectionComponent,
    ProductTagsSectionComponent,
    ProductImagesSectionComponent,
    ProductVariantsSectionComponent,
    ProductInventorySectionComponent
  ],
  template: `
    <app-admin-page-shell
      eyebrow="Catalog"
      [title]="pageTitle()"
      [description]="pageDescription()"
      backLink="/admin/products"
      backLabel="Back to products"
    >
      <div admin-page-actions class="flex flex-wrap items-center gap-3">
        @if (state.product(); as product) {
          <app-admin-status-badge [label]="statusLabel(product.status)" [variant]="statusVariant(product.status)" />
        }
      </div>

      @if (!state.pageReady()) {
        <app-loading-spinner />
      } @else if (state.loadError()) {
        <p class="text-sm text-rose-600">{{ state.loadError() }}</p>
      } @else {
        <div class="admin-profile-sections">
          @if (!state.categories().length) {
            <div class="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm dark:bg-amber-500/10">
              No categories found.
              <a routerLink="/admin/categories" class="font-semibold underline">Create a category first</a>
            </div>
          }

          <app-product-details-section />
          <app-product-tags-section />
          <app-product-images-section />
          <app-product-variants-section />
          <app-product-inventory-section />
        </div>
      }
    </app-admin-page-shell>
  `
})
export class ProductFormComponent implements OnInit {
  readonly state = inject(ProductFormStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly pageTitle = computed(() => {
    if (this.state.isNew()) return 'New product';
    return this.state.product()?.name ?? 'Edit product';
  });

  readonly pageDescription = computed(() =>
    this.state.isNew()
      ? 'Create the product, then save media, tags, variants, and inventory in each section.'
      : 'Update each section independently — changes save only when you use that section’s save action.'
  );

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.state.initEdit(id);
      } else {
        this.state.initNew();
      }
    });
  }

  statusLabel(status: ProductStatus): string {
    return productStatusLabel(status);
  }

  statusVariant(status: ProductStatus): 'active' | 'draft' | 'inactive' | 'archived' | 'neutral' {
    switch (status) {
      case ProductStatus.Active:
        return 'active';
      case ProductStatus.Draft:
        return 'draft';
      case ProductStatus.Inactive:
        return 'inactive';
      case ProductStatus.Archived:
        return 'archived';
      default:
        return 'neutral';
    }
  }
}
