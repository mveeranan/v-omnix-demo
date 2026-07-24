import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { take } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChevronDown, ChevronUp, Plus, Trash2, LucideAngularModule, Timer, X } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { ProductSearchComponent } from '@features/portfolio/shared/ui/product-search.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioDealOfWeek, DealOfWeekItem } from '../../models/portfolio.model';
import { ProductAdminService } from '@features/admin/products/data-access/product-admin.service';
import { ProductListItemDto } from '@features/catalog/models/product-admin.model';
import { LAYOUT_STYLES } from '@features/store/section-layout/layout-styles.registry';

@Component({
  selector: 'app-deal-of-week-editor-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    AdminDetailCardComponent,
    AdminDetailItemComponent,
    ProductSearchComponent
  ],
  template: `
    <app-website-section-shell sectionId="dealOfWeek" title="Deal of the week" [icon]="icon" [complete]="activeCount() > 0">
      <div view class="admin-detail-view">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="icon" label="Active deals" [value]="activeCount() + ' deal' + (activeCount() !== 1 ? 's' : '')" />
        </app-admin-detail-card>
        @if ((draft()?.dealOfWeek?.deals?.length ?? 0) > 0) {
          <div class="deals-preview-list">
            @for (deal of draft()?.dealOfWeek?.deals ?? []; track deal.id) {
              @if (deal.enabled) {
                <div class="deal-preview-item">
                  <span class="deal-preview-headline">{{ deal.headline || '(no headline)' }}</span>
                  <span class="deal-preview-product">{{ getProductName(deal.productId) }}</span>
                </div>
              }
            }
          </div>
        }
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show deals carousel" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <p class="pf-editor-hint">Display a carousel of featured deals to your customers. Create multiple deals to showcase different products.</p>

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="dow-display-name">Section heading (optional)</label>
            <input id="dow-display-name" class="pf-editor-input"
              [ngModel]="b.displayName ?? ''"
              (ngModelChange)="patch({ displayName: $event })"
              placeholder="e.g. Deal Of The Week" />
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Layout style</span>
            <div class="pf-layout-picker">
              @for (style of layoutStyles; track style.id) {
                <button type="button" class="pf-layout-option"
                  [class.pf-layout-option--active]="activeLayout(b) === style.id"
                  (click)="patch({ layoutStyle: style.id })">
                  <span class="pf-layout-option__name">{{ style.label }}</span>
                  @if (style.hint) { <span class="pf-layout-option__hint">{{ style.hint }}</span> }
                </button>
              }
            </div>
            <p class="pf-editor-hint mt-2">Changes only how deals are presented — your deals stay the same.</p>
          </div>

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="dow-item-limit">Deals to display on website</label>
            <input id="dow-item-limit" type="number" min="1" class="pf-editor-input pf-editor-input--narrow"
              [ngModel]="b.itemLimit ?? ''" (ngModelChange)="onItemLimitChange($event)"
              placeholder="All" />
            <p class="pf-editor-hint mt-2">Leave blank to show all active deals.</p>
          </div>

          @if (b.deals && b.deals.length > 0) {
            <div class="deals-list">
              @for (deal of b.deals; track deal.id; let i = $index) {
                <div class="deal-card">
                  <div class="deal-card__header">
                    <div class="deal-card__info">
                      <span class="deal-card__title">Deal {{ i + 1 }}: {{ deal.headline || '(no headline)' }}</span>
                    </div>
                    <div class="deal-card__actions">
                      <div class="deal-card__sort" role="group" aria-label="Reorder deal">
                        <button
                          type="button"
                          class="deal-card__sort-btn"
                          (click)="moveDealUp(deal.id)"
                          [disabled]="i === 0"
                          aria-label="Move deal up"
                        >
                          <lucide-icon [img]="upIcon" class="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          class="deal-card__sort-btn"
                          (click)="moveDealDown(deal.id)"
                          [disabled]="i === (b.deals?.length ?? 0) - 1"
                          aria-label="Move deal down"
                        >
                          <lucide-icon [img]="downIcon" class="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        class="deal-card__delete"
                        (click)="deleteDeal(deal.id)"
                        aria-label="Delete deal"
                      >
                        <lucide-icon [img]="deleteIcon" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div class="deal-card__content">
                    <div class="pf-editor-field">
                      <span class="pf-editor-label">Product</span>
                      @if (deal.productId) {
                        <div class="product-selected">
                          <span class="product-selected__name">{{ getProductName(deal.productId) }}</span>
                          <button
                            type="button"
                            class="product-selected__clear"
                            (click)="updateDeal(deal.id, { productId: '' })"
                            aria-label="Clear product selection"
                          >
                            <lucide-icon [img]="clearIcon" class="h-4 w-4" />
                          </button>
                        </div>
                      } @else {
                        <app-product-search (productSelected)="onProductSelected(deal.id, $event)" />
                      }
                    </div>

                    <div class="pf-editor-field">
                      <span class="pf-editor-label">Headline</span>
                      <input
                        class="pf-editor-input"
                        type="text"
                        [ngModel]="deal.headline"
                        (ngModelChange)="updateDeal(deal.id, { headline: $event })"
                        placeholder="e.g. Special Offer"
                      />
                    </div>

                    <div class="pf-editor-field">
                      <span class="pf-editor-label">Ends on</span>
                      <input
                        class="pf-editor-input"
                        type="date"
                        [ngModel]="dateInputValue(deal.endDate)"
                        (ngModelChange)="updateDeal(deal.id, { endDate: $event })"
                      />
                    </div>

                    <label class="deal-toggle-label">
                      <input
                        type="checkbox"
                        class="deal-toggle-input"
                        [ngModel]="deal.enabled"
                        (ngModelChange)="updateDeal(deal.id, { enabled: $event })"
                      />
                      <span class="deal-toggle-text">Show on storefront</span>
                    </label>
                  </div>
                </div>
              }
            </div>

            <button type="button" class="pf-deal-add-btn" (click)="addDeal()">
              <lucide-icon [img]="plusIcon" class="h-4 w-4" />
              Add another deal
            </button>
          } @else {
            <div class="pf-empty-state">
              <p class="pf-empty-state__text">No deals yet. Create your first deal to display on your storefront.</p>
              <button type="button" class="pf-deal-add-btn pf-deal-add-btn--prominent" (click)="addDeal()">
                <lucide-icon [img]="plusIcon" class="h-5 w-5" />
                Add your first deal
              </button>
            </div>
          }
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

    .deals-preview-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem 0;
    }

    .deal-preview-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      background: rgb(241 245 249);
      border: 1px solid rgb(226 232 240);
      font-size: 0.8125rem;
      color: rgb(51 65 85);
    }

    :host-context(.dark) .deal-preview-item {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .deal-preview-headline {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .deal-preview-product {
      font-size: 0.75rem;
      color: rgb(100 116 139);
    }

    :host-context(.dark) .deal-preview-product {
      color: rgb(161 161 170);
    }

    .deals-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .deal-card {
      border: 1px solid rgb(226 232 240);
      border-radius: 0.625rem;
      background: rgb(255 255 255);
    }

    :host-context(.dark) .deal-card {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
    }

    .deal-card__header {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.75rem;
      box-sizing: border-box;
      background: rgb(241 245 249);
      border-bottom: 1px solid rgb(226 232 240);
      border-radius: 0.5rem 0.5rem 0 0;
    }

    :host-context(.dark) .deal-card__header {
      background: rgb(24 24 27);
      border-bottom-color: rgb(63 63 70);
      border-radius: 0.5rem 0.5rem 0 0;
    }

    .deal-card__info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1 1 auto;
      min-width: 0;
    }

    .deal-card__title {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.75rem;
      color: rgb(51 65 85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host-context(.dark) .deal-card__title {
      color: rgb(212 212 216);
    }

    .deal-card__actions {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      flex: 0 0 auto;
      margin-left: auto;
      gap: 0.75rem;
    }

    .deal-card__content {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .deal-card__sort {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      flex-shrink: 0;
      gap: 0.375rem;
    }

    .deal-card__sort-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 1.75rem;
      width: 1.75rem;
      padding: 0;
      border-radius: 0.375rem;
      border: 1px solid rgb(203 213 225);
      background: rgb(226 232 240);
      color: rgb(71 85 105);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    :host-context(.dark) .deal-card__sort-btn {
      border-color: rgb(82 82 91);
      background: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .deal-card__sort-btn:hover:not(:disabled) {
      background: rgb(255 255 255);
      border-color: rgb(203 213 225);
      color: rgb(15 23 42);
    }

    :host-context(.dark) .deal-card__sort-btn:hover:not(:disabled) {
      background: rgb(39 39 42);
      border-color: rgb(113 113 122);
      color: rgb(250 250 250);
    }

    .deal-card__sort-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .deal-card__delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 1.75rem;
      width: 1.75rem;
      padding: 0;
      border-radius: 0.375rem;
      border: 1px solid rgb(226 232 240);
      background: rgb(255 255 255);
      color: rgb(239 68 68);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    :host-context(.dark) .deal-card__delete {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
      color: rgb(248 113 113);
    }

    .deal-card__delete:hover {
      background: rgb(254 242 242);
      border-color: rgb(254 202 202);
      color: rgb(220 38 38);
    }

    :host-context(.dark) .deal-card__delete:hover {
      background: rgb(63 29 29);
      border-color: rgb(127 29 29);
      color: rgb(252 165 165);
    }

    .pf-deal-add-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      margin-top: 0.75rem;
      background: rgb(255 255 255);
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(51 65 85);
      transition: all 0.2s;
    }

    :host-context(.dark) .pf-deal-add-btn {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .pf-deal-add-btn:hover {
      background: rgb(248 250 252);
      border-color: rgb(124 58 237);
      color: rgb(124 58 237);
    }

    :host-context(.dark) .pf-deal-add-btn:hover {
      background: rgb(24 24 27);
      border-color: rgb(167 139 250);
      color: rgb(196 181 253);
    }

    .pf-deal-add-btn--prominent {
      width: 100%;
      justify-content: center;
      padding: 1rem 1.25rem;
      background: rgb(124 58 237);
      border-color: rgb(124 58 237);
      color: rgb(255 255 255);
      font-weight: 600;
    }

    .pf-deal-add-btn--prominent:hover {
      background: rgb(109 40 217);
      border-color: rgb(109 40 217);
    }

    :host-context(.dark) .pf-deal-add-btn--prominent {
      background: rgb(124 58 237);
      border-color: rgb(124 58 237);
    }

    :host-context(.dark) .pf-deal-add-btn--prominent:hover {
      background: rgb(139 92 246);
      border-color: rgb(139 92 246);
    }

    .pf-empty-state {
      text-align: center;
      padding: 2rem 1.5rem;
      background: rgb(248 250 252);
      border: 1px dashed rgb(203 213 225);
      border-radius: 0.625rem;
    }

    :host-context(.dark) .pf-empty-state {
      background: rgb(24 24 27);
      border-color: rgb(63 63 70);
    }

    .pf-empty-state__text {
      margin: 0 0 1.25rem;
      color: rgb(100 116 139);
      font-size: 0.95rem;
    }

    :host-context(.dark) .pf-empty-state__text {
      color: rgb(161 161 170);
    }

    .deal-toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .deal-toggle-input {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
      accent-color: rgb(124 58 237);
    }

    .deal-toggle-text {
      font-size: 0.875rem;
      color: rgb(71 85 105);
    }

    :host-context(.dark) .deal-toggle-text {
      color: rgb(212 212 216);
    }

    .pf-editor-hint {
      margin: 0 0 1rem;
      color: rgb(100 116 139);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    :host-context(.dark) .pf-editor-hint {
      color: rgb(161 161 170);
    }

    .product-selected {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.375rem;
      background: rgb(248 250 252);
    }

    :host-context(.dark) .product-selected {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
    }

    .product-selected__name {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(51 65 85);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host-context(.dark) .product-selected__name {
      color: rgb(212 212 216);
    }

    .product-selected__clear {
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

    :host-context(.dark) .product-selected__clear {
      background: rgb(52 52 56);
      border-color: rgb(63 63 70);
      color: rgb(248 113 113);
    }

    .product-selected__clear:hover {
      background: rgb(254 242 242);
      border-color: rgb(254 202 202);
    }

    :host-context(.dark) .product-selected__clear:hover {
      background: rgb(63 29 29);
      border-color: rgb(127 29 29);
    }
  `
})
export class DealOfWeekEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductAdminService);

  readonly draft = this.state.draft;
  readonly icon = Timer;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioDealOfWeek>('dealOfWeek'));
  readonly layoutStyles = LAYOUT_STYLES['dealOfWeek'] ?? [];
  readonly products = signal<ProductListItemDto[]>([]);

  readonly upIcon = ChevronUp;
  readonly downIcon = ChevronDown;
  readonly deleteIcon = Trash2;
  readonly plusIcon = Plus;
  readonly clearIcon = X;

  constructor() {
    // When the edit buffer is populated, load names for any pre-existing product IDs
    effect(() => {
      const b = this.buffer() as PortfolioDealOfWeek | null;
      if (!b?.deals?.length) return;

      const allIds = b.deals.map(d => d.productId).filter((id): id is string => !!id);
      if (!allIds.length) return;

      const loadedIds = new Set(untracked(() => this.products().map(p => p.id)));
      const missing = allIds.filter(id => !loadedIds.has(id));
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

  /**
   * Get product name by ID
   */
  getProductName(productId: string): string {
    return this.products().find((p) => p.id === productId)?.name ?? 'Unknown product';
  }

  /**
   * Count active (enabled) deals
   */
  activeCount(): number {
    const dw = this.draft()?.dealOfWeek;
    if (!dw?.deals?.length) return 0;
    return dw.deals.filter((deal) => deal.enabled).length;
  }

  /**
   * Patch deal of week settings
   */
  patch(partial: Partial<PortfolioDealOfWeek>): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => ({ ...b, ...partial }));
  }

  activeLayout(b: PortfolioDealOfWeek): string {
    return b.layoutStyle || 'carousel';
  }

  onItemLimitChange(value: number | string): void {
    if (value === '' || value === null || value === undefined) {
      this.patch({ itemLimit: undefined });
      return;
    }
    const n = Math.max(1, Math.floor(Number(value) || 1));
    this.patch({ itemLimit: n });
  }

  /**
   * Add a new deal
   */
  addDeal(): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => {
      const newId = crypto.randomUUID();
      const order = (b.deals?.length ?? 0);
      const newDeal: DealOfWeekItem = {
        id: newId,
        productId: '',
        headline: '',
        endDate: '',
        enabled: true,
        order
      };
      return {
        ...b,
        deals: [...(b.deals ?? []), newDeal]
      };
    });
  }

  /**
   * Delete a deal by ID
   */
  deleteDeal(id: string): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => ({
      ...b,
      deals: (b.deals ?? []).filter((deal) => deal.id !== id).map((deal, i) => ({ ...deal, order: i }))
    }));
  }

  /**
   * Update a deal by ID
   */
  updateDeal(id: string, updates: Partial<DealOfWeekItem>): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => ({
      ...b,
      deals: (b.deals ?? []).map((deal) => (deal.id === id ? { ...deal, ...updates } : deal))
    }));
  }

  /**
   * Move deal up in order
   */
  moveDealUp(id: string): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => {
      const deals = [...(b.deals ?? [])];
      const idx = deals.findIndex((deal) => deal.id === id);
      if (idx > 0) {
        const temp = deals[idx];
        deals[idx] = deals[idx - 1];
        deals[idx - 1] = temp;
        return {
          ...b,
          deals: deals.map((deal, i) => ({ ...deal, order: i }))
        };
      }
      return b;
    });
  }

  /**
   * Move deal down in order
   */
  moveDealDown(id: string): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => {
      const deals = [...(b.deals ?? [])];
      const idx = deals.findIndex((deal) => deal.id === id);
      if (idx < deals.length - 1) {
        const temp = deals[idx];
        deals[idx] = deals[idx + 1];
        deals[idx + 1] = temp;
        return {
          ...b,
          deals: deals.map((deal, i) => ({ ...deal, order: i }))
        };
      }
      return b;
    });
  }

  /**
   * Handle product selection from search
   */
  onProductSelected(dealId: string, product: ProductListItemDto): void {
    this.products.set([...this.products(), product]);
    this.updateDeal(dealId, { productId: product.id });
  }

  /**
   * Convert ISO date string to input[type="date"] format
   */
  dateInputValue(iso?: string): string {
    return iso ? iso.slice(0, 10) : '';
  }
}
