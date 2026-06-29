import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Package, Tag, Type } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioSaleCollection } from '../../models/portfolio.model';
import { ProductApiService } from '../../../store/data-access/product-api.service';
import { CatalogProductListItemDto, catalogPrimaryImage } from '@features/catalog/models/catalog-storefront.model';

@Component({
  selector: 'app-sale-collection-editor-section',
  standalone: true,
  imports: [CommonModule, FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent],
  template: `
    <app-website-section-shell sectionId="saleCollection" title="Sale collection" [icon]="icon" [complete]="!!draft()?.saleCollection?.title">
      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="titleIcon" label="Title" [value]="draft()?.saleCollection?.title" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="productsIcon" label="Products" [value]="pinnedCount() + ' pinned'" />
          </app-admin-detail-card>
        </div>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show sale collection" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Section title</span>
            <input class="pf-editor-input" [ngModel]="b.title" (ngModelChange)="patch({ title: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Subtitle</span>
            <input class="pf-editor-input" [ngModel]="b.subtitle" (ngModelChange)="patch({ subtitle: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Max products (1–8)</span>
            <input type="number" min="1" max="8" class="pf-editor-input" [ngModel]="b.maxCount" (ngModelChange)="patch({ maxCount: +$event })" />
          </div>
          <p class="pf-editor-hint">Pin products for the horizontal sale row on your homepage.</p>
          <p class="pf-editor-hint">Products already shown in a section above are hidden on the live home page.</p>
          @if (loading()) {
            <p class="pf-editor-muted">Loading products…</p>
          } @else {
            <div class="pf-product-pin-list">
              @for (product of catalog(); track product.id) {
                <label class="pf-product-pin-item">
                  <input type="checkbox" [checked]="isPinned(product.id)" (change)="togglePin(product.id, $any($event.target).checked)" />
                  <img [src]="productImage(product)" alt="" class="pf-product-pin-item__img" />
                  <span class="pf-product-pin-item__name">{{ product.name }}</span>
                </label>
              }
            </div>
          }
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-product-pin-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .pf-product-pin-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border-subtle); cursor: pointer; }
    .pf-product-pin-item__img { width: 2.5rem; height: 2.5rem; object-fit: cover; border-radius: 0.25rem; }
    .pf-product-pin-item__name { flex: 1; font-size: 0.875rem; }
  `
})
export class SaleCollectionEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductApiService);
  readonly draft = this.state.draft;
  readonly icon = Tag;
  readonly titleIcon = Type;
  readonly productsIcon = Package;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioSaleCollection>('saleCollection'));
  readonly catalog = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);

  pinnedCount = computed(() => this.buffer()?.productIds?.length ?? 0);

  productImage(product: CatalogProductListItemDto): string {
    return catalogPrimaryImage(product);
  }

  ngOnInit(): void {
    const slug = this.draft()?.slug;
    if (!slug) {
      this.loading.set(false);
      return;
    }
    this.productApi.listByStore(slug).subscribe({
      next: (r) => {
        this.catalog.set(r.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  isPinned(id: string): boolean {
    return this.buffer()?.productIds.includes(id) ?? false;
  }

  togglePin(id: string, checked: boolean): void {
    this.sectionState.patchBuffer<PortfolioSaleCollection>('saleCollection', (b) => {
      let ids = [...b.productIds];
      if (checked) {
        if (!ids.includes(id)) ids.push(id);
      } else {
        ids = ids.filter((x) => x !== id);
      }
      return { ...b, productIds: ids };
    });
  }

  patch(partial: Partial<PortfolioSaleCollection>): void {
    this.sectionState.patchBuffer<PortfolioSaleCollection>('saleCollection', (b) => ({ ...b, ...partial }));
  }
}
