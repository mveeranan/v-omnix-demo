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
import { LAYOUT_STYLES } from '@features/store/section-layout/layout-styles.registry';

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
            <label class="pf-editor-label" for="fp-display-name">Section heading</label>
            <input id="fp-display-name" class="pf-editor-input" [ngModel]="b.displayName ?? ''" (ngModelChange)="patch({ displayName: $event })" placeholder="e.g. Trending Now" />
            <p class="pf-editor-hint mt-2">The heading shown above this section on your website.</p>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Layout style</span>
            <div class="pf-layout-picker">
              @for (style of layoutStyles; track style.id) {
                <button type="button" class="pf-layout-option" [class.pf-layout-option--active]="activeLayout(b) === style.id" (click)="patch({ layoutStyle: style.id })">
                  <span class="pf-layout-option__name">{{ style.label }}</span>
                  @if (style.hint) { <span class="pf-layout-option__hint">{{ style.hint }}</span> }
                </button>
              }
            </div>
            <p class="pf-editor-hint mt-2">Changes only how products are presented — your selected products stay the same.</p>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Promo marquee text (optional)</span>
            <input class="pf-editor-input" [ngModel]="b.promoMarqueeText" (ngModelChange)="patch({ promoMarqueeText: $event })" placeholder="Free shipping this week only" />
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [ngModel]="b.showQtyControls" (ngModelChange)="patch({ showQtyControls: $event })" /> Show quantity controls on cards
          </label>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Products ({{ b.productIds.length }} selected)</span>
            <app-product-search (productSelected)="addProduct($event)" />
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

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="fp-item-limit">Products to display on website</label>
            <input id="fp-item-limit" type="number" min="1" class="pf-editor-input pf-editor-input--narrow"
              [ngModel]="b.itemLimit ?? b.productIds.length ?? b.maxCount" (ngModelChange)="onItemLimitChange($event)" />
            <p class="pf-editor-hint mt-2">How many of your selected products to show. You've selected {{ b.productIds.length }}.</p>
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-editor-input--narrow { max-width: 8rem; }

    .pf-layout-picker {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    .pf-layout-option {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0.9rem;
      text-align: left;
      background: var(--surface, #fff);
      border: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .pf-layout-option:hover {
      border-color: color-mix(in srgb, var(--primary, #ff6f00) 50%, var(--border-subtle, #e5e7eb));
    }
    .pf-layout-option--active {
      border-color: var(--primary, #ff6f00);
      box-shadow: 0 0 0 1px var(--primary, #ff6f00) inset;
      background: color-mix(in srgb, var(--primary, #ff6f00) 6%, transparent);
    }
    .pf-layout-option__name { font-size: 0.875rem; font-weight: 600; color: var(--text, #111827); }
    .pf-layout-option__hint { font-size: 0.72rem; color: var(--text-muted, #6b7280); line-height: 1.3; }

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
  readonly layoutStyles = LAYOUT_STYLES['featuredProducts'] ?? [];
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
      if (!b.productIds.includes(product.id)) {
        return { ...b, productIds: [...b.productIds, product.id] };
      }
      return b;
    });
  }

  /** The effective layout style shown as selected in the picker. */
  activeLayout(b: PortfolioFeaturedProducts): string {
    return b.layoutStyle || 'standard-grid';
  }

  /** How many products to display on the live site (does not trim the selection). */
  onItemLimitChange(value: number | string): void {
    const n = Math.max(1, Math.floor(Number(value) || 1));
    this.patch({ itemLimit: n });
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
