import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Hash, Package, Pin } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioFeaturedProducts } from '../../models/portfolio.model';
import { ProductApiService } from '../../../store/data-access/product-api.service';
import { CatalogProductListItemDto, catalogPrimaryImage } from '@features/catalog/models/catalog-storefront.model';

@Component({
  selector: 'app-featured-products-editor-section',
  standalone: true,
  imports: [CommonModule, FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent],
  template: `
    <app-website-section-shell
      sectionId="featuredProducts"
      title="Featured Products"
      [icon]="icon"
      [complete]="pinnedCount() > 0"
    >
      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="maxCountIcon" label="Max products to show" [value]="draft()?.featuredProducts?.maxCount" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="pinnedIcon" label="Pinned products" [value]="pinnedCount() + ' selected'" />
          </app-admin-detail-card>
        </div>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show featured products section"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Promo marquee text</span>
            <input class="pf-editor-input" [ngModel]="b.promoMarqueeText" (ngModelChange)="patch({ promoMarqueeText: $event })" />
          </div>
          <app-section-toggle label="Show quantity controls on cards" [enabled]="b.showQtyControls" (enabledChange)="patch({ showQtyControls: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Max products to display (1–12)</span>
            <input
              type="number"
              min="1"
              max="12"
              class="pf-editor-input"
              [ngModel]="b.maxCount"
              (ngModelChange)="patch({ maxCount: +$event })"
            />
          </div>
          <p class="pf-editor-hint">Pin products to feature on your storefront home page.</p>
          @if (loading()) {
            <p class="pf-editor-muted">Loading products…</p>
          } @else {
            <div class="pf-product-pin-list">
              @for (product of catalog(); track product.id) {
                <label class="pf-product-pin-item">
                  <input
                    type="checkbox"
                    [checked]="isPinned(product.id)"
                    (change)="togglePin(product.id, $any($event.target).checked)"
                  />
                  <img [src]="productImage(product)" alt="" class="pf-product-pin-item__img" />
                  <span class="pf-product-pin-item__name">{{ product.name }}</span>
                  <span class="pf-product-pin-item__price">{{ product.price | currency: 'USD' }}</span>
                </label>
              }
            </div>
          }
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-product-pin-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .pf-product-pin-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.5rem;
      cursor: pointer;
    }

    .pf-product-pin-item__img {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: cover;
      border-radius: 0.375rem;
    }

    .pf-product-pin-item__name {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .pf-product-pin-item__price {
      font-size: 0.8125rem;
      color: rgb(100 116 139);
    }
  `
})
export class FeaturedProductsEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductApiService);

  readonly draft = this.state.draft;
  readonly icon = Package;
  readonly maxCountIcon = Hash;
  readonly pinnedIcon = Pin;
  readonly catalog = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);

  readonly buffer = computed(() => this.sectionState.buffer<PortfolioFeaturedProducts>('featuredProducts'));
  readonly pinnedCount = computed(() => this.draft()?.featuredProducts.productIds.length ?? 0);

  productImage(product: CatalogProductListItemDto): string {
    return catalogPrimaryImage(product);
  }

  ngOnInit(): void {
    const slug = this.draft()?.slug || 'demo';
    this.productApi.listByStore(slug).subscribe({
      next: (result) => {
        this.catalog.set(result.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  patch(partial: Partial<PortfolioFeaturedProducts>): void {
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => ({ ...b, ...partial }));
  }

  isPinned(id: string): boolean {
    return this.buffer()?.productIds.includes(id) ?? false;
  }

  togglePin(id: string, checked: boolean): void {
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => {
      const ids = checked
        ? [...b.productIds, id]
        : b.productIds.filter((pid) => pid !== id);
      return { ...b, productIds: ids };
    });
  }
}
