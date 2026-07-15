import { Component, computed, effect, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogBrandDto, CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';

interface FlatCategory {
  id: string;
  slug: string;
  name: string;
  indent: string;
}

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
        <select class="msp-sidebar__select msp-sidebar__select--full" [(ngModel)]="selectedCategoryValue" (ngModelChange)="selectCategory($event)">
          <option [ngValue]="undefined">All products</option>
          @for (category of flattenedCategories(); track category.id) {
            <option [ngValue]="category.slug">
              {{ category.indent }}{{ category.name }}
            </option>
          }
        </select>
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
          <select class="msp-sidebar__select msp-sidebar__select--full" [(ngModel)]="selectedBrandValue" (ngModelChange)="selectBrand($event)">
            <option [ngValue]="undefined">All brands</option>
            @for (brand of brands(); track brand.id) {
              <option [ngValue]="brand.slug">{{ brand.name }} ({{ brand.productCount }})</option>
            }
          </select>
        </div>
      }
    </aside>
  `,
  styles: `
    .msp-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
    .msp-sidebar__box {
      background: var(--mox-surface, #fff);
      padding: 1.25rem;
      border: 1px solid var(--mox-border, #e8e8e8);
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .msp-sidebar__heading {
      margin: 0 0 0.8rem;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mox-text, #23232d);
    }

    .msp-sidebar__price-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .msp-sidebar__select {
      padding: 0.6rem 0.75rem 0.6rem 0.75rem;
      border: 1px solid var(--mox-border, #d9d9d9);
      background: var(--mox-surface, #fff);
      color: var(--mox-text, #23232d);
      font-size: 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .msp-sidebar__select:hover {
      border-color: var(--mox-accent, #ff6f00);
    }
    .msp-sidebar__select:focus {
      outline: none;
      border-color: var(--mox-accent, #ff6f00);
      box-shadow: 0 0 0 2px rgba(255, 111, 0, 0.1);
    }
    .msp-sidebar__select--full {
      width: 100%;
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

  readonly selectedCategoryValue = signal<string | undefined>(undefined);
  readonly selectedBrandValue = signal<string | undefined>(undefined);

  minPriceValue: number | undefined;
  maxPriceValue: number | undefined;

  readonly flattenedCategories = computed(() => {
    const result: FlatCategory[] = [];
    const flatten = (cats: CatalogCategoryDto[], level: number) => {
      cats.forEach(cat => {
        const indent = level > 0 ? '   ' : '';
        result.push({ id: cat.id, slug: cat.slug, name: cat.name, indent });
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children, level + 1);
        }
      });
    };
    flatten(this.categories(), 0);
    return result;
  });

  constructor() {
    effect(() => {
      this.selectedCategoryValue.set(this.selectedCategorySlug());
      this.selectedBrandValue.set(this.selectedBrandSlug());
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
