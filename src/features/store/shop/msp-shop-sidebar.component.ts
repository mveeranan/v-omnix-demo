import { Component, effect, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogBrandDto, CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';

export interface ShopSidebarFilters {
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Minishop shop-page sidebar: white box with a dotted-border category accordion
 * (real ProductCategory tree from the API — no hardcoded categories) plus a
 * price-range "from/to" control and, when the store has brands, a brand list.
 */
@Component({
  selector: 'app-msp-shop-sidebar',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <aside class="msp-sidebar">
      <div class="msp-sidebar__box">
        <p class="msp-sidebar__heading">Categories</p>
        <ul class="msp-sidebar__accordion">
          <li>
            <button
              type="button"
              class="msp-sidebar__item"
              [class.msp-sidebar__item--active]="!selectedCategorySlug()"
              (click)="selectCategory(undefined)"
            >
              All products
            </button>
          </li>
          @for (category of categories(); track category.id) {
            <li>
              <button
                type="button"
                class="msp-sidebar__item"
                [class.msp-sidebar__item--active]="selectedCategorySlug() === category.slug"
                (click)="selectCategory(category.slug)"
              >
                <span>{{ category.name }}</span>
                @if (category.children.length) {
                  <span class="msp-sidebar__toggle" (click)="toggleExpanded($event, category.id)">
                    {{ expanded().has(category.id) ? '−' : '+' }}
                  </span>
                }
              </button>
              @if (category.children.length && expanded().has(category.id)) {
                <ul class="msp-sidebar__children">
                  @for (child of category.children; track child.id) {
                    <li>
                      <button
                        type="button"
                        class="msp-sidebar__item msp-sidebar__item--child"
                        [class.msp-sidebar__item--active]="selectedCategorySlug() === child.slug"
                        (click)="selectCategory(child.slug)"
                      >
                        {{ child.name }}
                      </button>
                    </li>
                  }
                </ul>
              }
            </li>
          }
        </ul>
      </div>

      <div class="msp-sidebar__box">
        <p class="msp-sidebar__heading">Price</p>
        <div class="msp-sidebar__price-row">
          <select class="msp-sidebar__select" [(ngModel)]="minPriceValue" (ngModelChange)="emitPrice()">
            <option [ngValue]="undefined">From</option>
            @for (opt of priceOptions(); track opt) {
              <option [ngValue]="opt">{{ opt | number: '1.0-0' }}</option>
            }
          </select>
          <span class="msp-sidebar__price-sep">—</span>
          <select class="msp-sidebar__select" [(ngModel)]="maxPriceValue" (ngModelChange)="emitPrice()">
            <option [ngValue]="undefined">To</option>
            @for (opt of priceOptions(); track opt) {
              <option [ngValue]="opt">{{ opt | number: '1.0-0' }}</option>
            }
          </select>
        </div>
      </div>

      @if (brands().length) {
        <div class="msp-sidebar__box">
          <p class="msp-sidebar__heading">Brand</p>
          <ul class="msp-sidebar__accordion">
            <li>
              <button
                type="button"
                class="msp-sidebar__item"
                [class.msp-sidebar__item--active]="!selectedBrandSlug()"
                (click)="selectBrand(undefined)"
              >
                All brands
              </button>
            </li>
            @for (brand of brands(); track brand.id) {
              <li>
                <button
                  type="button"
                  class="msp-sidebar__item"
                  [class.msp-sidebar__item--active]="selectedBrandSlug() === brand.slug"
                  (click)="selectBrand(brand.slug)"
                >
                  {{ brand.name }} ({{ brand.productCount }})
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </aside>
  `,
  styles: `
    .msp-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
    .msp-sidebar__box {
      background: var(--mox-surface, #fff);
      padding: 1.5rem;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
    }
    .msp-sidebar__heading {
      margin: 0 0 1rem;
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--mox-text, #23232d);
    }
    .msp-sidebar__accordion { list-style: none; margin: 0; padding: 0; }
    .msp-sidebar__accordion li { border-bottom: 1px dotted var(--mox-border, #d9d9d9); }
    .msp-sidebar__accordion li:last-child { border-bottom: none; }
    .msp-sidebar__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.65rem 0;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      font-size: 0.85rem;
      color: var(--mox-muted, #808080);
      transition: color 0.2s ease;
    }
    .msp-sidebar__item:hover,
    .msp-sidebar__item--active {
      color: var(--mox-accent, #dbcc8f);
    }
    .msp-sidebar__item--child { padding-left: 1rem; font-size: 0.8rem; }
    .msp-sidebar__toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      font-size: 0.9rem;
    }
    .msp-sidebar__children { list-style: none; margin: 0; padding: 0 0 0.4rem; }

    .msp-sidebar__price-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .msp-sidebar__select {
      flex: 1 1 0;
      padding: 0.5rem 0.6rem;
      border: 1px solid var(--mox-border, #d9d9d9);
      background: var(--mox-surface, #fff);
      color: var(--mox-text, #23232d);
      font-size: 0.85rem;
    }
    .msp-sidebar__price-sep { color: var(--mox-muted, #808080); }
  `
})
export class MspShopSidebarComponent {
  readonly categories = input<CatalogCategoryDto[]>([]);
  readonly brands = input<CatalogBrandDto[]>([]);
  readonly selectedCategorySlug = input<string | undefined>(undefined);
  readonly selectedBrandSlug = input<string | undefined>(undefined);
  readonly minPrice = input<number | undefined>(undefined);
  readonly maxPrice = input<number | undefined>(undefined);
  /** Ceiling used to generate the price-range select options — pass the highest product price in the catalog. */
  readonly priceCeiling = input<number>(200);

  readonly filtersChange = output<ShopSidebarFilters>();

  readonly expanded = signal<Set<string>>(new Set());

  minPriceValue: number | undefined;
  maxPriceValue: number | undefined;

  constructor() {
    // Keep the local select values in sync when the parent resets filters externally
    // (e.g. a "clear filters" action), without fighting the user's own selections.
    effect(() => {
      this.minPriceValue = this.minPrice();
      this.maxPriceValue = this.maxPrice();
    });
  }

  priceOptions(): number[] {
    const ceiling = Math.max(50, Math.ceil(this.priceCeiling() / 10) * 10);
    const step = ceiling <= 200 ? 10 : Math.ceil(ceiling / 20 / 10) * 10;
    const opts: number[] = [];
    for (let v = step; v <= ceiling; v += step) opts.push(v);
    return opts;
  }

  toggleExpanded(event: Event, categoryId: string): void {
    event.stopPropagation();
    const next = new Set(this.expanded());
    if (next.has(categoryId)) next.delete(categoryId);
    else next.add(categoryId);
    this.expanded.set(next);
  }

  selectCategory(slug: string | undefined): void {
    this.filtersChange.emit({
      categorySlug: slug,
      brandSlug: this.selectedBrandSlug(),
      minPrice: this.minPriceValue,
      maxPrice: this.maxPriceValue
    });
  }

  selectBrand(slug: string | undefined): void {
    this.filtersChange.emit({
      categorySlug: this.selectedCategorySlug(),
      brandSlug: slug,
      minPrice: this.minPriceValue,
      maxPrice: this.maxPriceValue
    });
  }

  emitPrice(): void {
    this.filtersChange.emit({
      categorySlug: this.selectedCategorySlug(),
      brandSlug: this.selectedBrandSlug(),
      minPrice: this.minPriceValue,
      maxPrice: this.maxPriceValue
    });
  }
}
