import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Star, X, LucideAngularModule } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { ProductSearchComponent } from '@features/portfolio/shared/ui/product-search.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioFeaturedProducts } from '../../models/portfolio.model';
import { ProductAdminService } from '@features/admin/products/data-access/product-admin.service';
import { ProductListItemDto } from '@features/catalog/models/product-admin.model';

@Component({
  selector: 'app-featured-products-editor-section',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent, AdminDetailItemComponent, ProductSearchComponent],
  template: `
    <app-website-section-shell sectionId="featuredProducts" title="Featured products" [icon]="icon" [complete]="(draft()?.featuredProducts?.productIds?.length ?? 0) > 0">
      <div view class="admin-detail-view">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="icon" [label]="'Selected products'" [value]="(draft()?.featuredProducts?.productIds?.length ?? 0) + ' selected'" />
        </app-admin-detail-card>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show featured products" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Promo marquee text (optional)</span>
            <input class="pf-editor-input" [ngModel]="b.promoMarqueeText" (ngModelChange)="patch({ promoMarqueeText: $event })" placeholder="Free shipping this week only" />
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [ngModel]="b.showQtyControls" (ngModelChange)="patch({ showQtyControls: $event })" /> Show quantity controls on cards
          </label>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Products ({{ b.productIds.length }} selected, max 8)</span>
            @if (b.productIds.length < 8) {
              <app-product-search (productSelected)="addProduct($event)" />
            }
            @if (b.productIds.length > 0) {
              <div class="selected-products">
                @for (productId of b.productIds; track productId) {
                  <div class="selected-product">
                    <span class="selected-product__name">{{ getProductName(productId) }}</span>
                    <button
                      type="button"
                      class="selected-product__remove"
                      (click)="removeProduct(productId)"
                      aria-label="Remove product"
                    >
                      <lucide-icon [img]="removeIcon" class="h-4 w-4" />
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .selected-products {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-top: 0.75rem;
      padding: 0.5rem;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      background: rgb(248 250 252);
      min-height: auto;
    }

    :host-context(.dark) .selected-products {
      background: rgb(24 24 27);
      border-color: rgb(63 63 70);
    }

    .selected-product {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 0.625rem;
      background: white;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
    }

    :host-context(.dark) .selected-product {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
    }

    .selected-product__name {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(51 65 85);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host-context(.dark) .selected-product__name {
      color: rgb(212 212 216);
    }

    .selected-product__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.75rem;
      height: 1.75rem;
      padding: 0;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      background: white;
      color: rgb(239 68 68);
      cursor: pointer;
      transition: background-color 0.15s, border-color 0.15s;
    }

    :host-context(.dark) .selected-product__remove {
      background: rgb(52 52 56);
      border-color: rgb(63 63 70);
      color: rgb(248 113 113);
    }

    .selected-product__remove:hover {
      background: rgb(254 242 242);
      border-color: rgb(254 202 202);
    }

    :host-context(.dark) .selected-product__remove:hover {
      background: rgb(63 29 29);
      border-color: rgb(127 29 29);
    }
  `
})
export class FeaturedProductsEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductAdminService);

  readonly draft = this.state.draft;
  readonly icon = Star;
  readonly removeIcon = X;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioFeaturedProducts>('featuredProducts'));
  readonly products = signal<ProductListItemDto[]>([]);

  readonly getProductName = (productId: string): string => {
    return this.products().find((p) => p.id === productId)?.name ?? '';
  };

  constructor() {
    // When the edit buffer is populated, load names for any pre-existing product IDs
    effect(() => {
      const b = this.buffer() as PortfolioFeaturedProducts | null;
      if (!b?.productIds?.length) return;

      const loadedIds = new Set(untracked(() => this.products().map(p => p.id)));
      const missing = b.productIds.filter(id => !!id && !loadedIds.has(id));
      if (!missing.length) return;

      missing.forEach(id => {
        this.productApi.getById(id).pipe(take(1)).subscribe({
          next: (detail) => {
            if (!detail) return;
            const item: ProductListItemDto = {
              id: detail.id,
              name: detail.name,
              slug: detail.slug,
              sku: detail.sku,
              price: detail.price,
              status: detail.status,
              categoryId: detail.categoryId,
              categoryName: detail.categoryName,
              brandId: detail.brandId,
              brandName: detail.brandName,
              productTypeId: detail.productTypeId,
              productTypeName: detail.productTypeName,
              isNew: detail.isNew,
              displayOrder: detail.displayOrder,
              primaryImageUrl: detail.images?.find(i => i.isPrimary)?.url ?? detail.images?.[0]?.url ?? null,
              variantCount: detail.variants?.length ?? 0,
              isFeatured: false
            };
            this.products.update(list => list.some(p => p.id === id) ? list : [...list, item]);
          },
          error: () => undefined
        });
      });
    });
  }

  ngOnInit(): void {}

  addProduct(product: ProductListItemDto): void {
    this.products.set([...this.products(), product]);
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => {
      if (!b.productIds.includes(product.id) && b.productIds.length < 8) {
        return { ...b, productIds: [...b.productIds, product.id] };
      }
      return b;
    });
  }

  removeProduct(productId: string): void {
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => ({
      ...b,
      productIds: b.productIds.filter((id) => id !== productId)
    }));
  }

  patch(partial: Partial<PortfolioFeaturedProducts>): void {
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => ({ ...b, ...partial }));
  }
}
