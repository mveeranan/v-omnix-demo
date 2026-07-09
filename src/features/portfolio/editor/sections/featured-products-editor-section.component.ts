import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Star } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioFeaturedProducts } from '../../models/portfolio.model';
import { ProductAdminService } from '@features/admin/products/data-access/product-admin.service';
import { ProductListItemDto } from '@features/catalog/models/product-admin.model';

@Component({
  selector: 'app-featured-products-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent, AdminDetailItemComponent],
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
            <span class="pf-editor-label">Max products to show</span>
            <input class="pf-editor-input" type="number" min="1" max="12" [ngModel]="b.maxCount" (ngModelChange)="patch({ maxCount: $event })" />
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
            <div class="pf-editor-checklist">
              @for (p of products(); track p.id) {
                <label class="flex items-center gap-2 text-sm">
                  <input type="checkbox" [checked]="b.productIds.includes(p.id)" (change)="toggleProduct(p.id)" /> {{ p.name }}
                </label>
              }
            </div>
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-editor-checklist {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 16rem;
      overflow-y: auto;
      padding: 0.5rem;
      border: 1px solid var(--border, rgb(226 232 240));
      border-radius: 0.5rem;
    }
  `
})
export class FeaturedProductsEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductAdminService);

  readonly draft = this.state.draft;
  readonly icon = Star;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioFeaturedProducts>('featuredProducts'));
  readonly products = signal<ProductListItemDto[]>([]);

  ngOnInit(): void {
    this.productApi.list({ pageSize: 100 }).subscribe({
      next: (r) => this.products.set(r.items),
      error: () => this.products.set([])
    });
  }

  toggleProduct(id: string): void {
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => {
      const has = b.productIds.includes(id);
      return {
        ...b,
        productIds: has ? b.productIds.filter((x) => x !== id) : [...b.productIds, id]
      };
    });
  }

  patch(partial: Partial<PortfolioFeaturedProducts>): void {
    this.sectionState.patchBuffer<PortfolioFeaturedProducts>('featuredProducts', (b) => ({ ...b, ...partial }));
  }
}
