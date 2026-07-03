import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductListFilters } from '../models/product.model';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="product-filters space-y-4">
      <!-- Search -->
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--mox-muted)">Search</p>
        <input
          class="mox-input"
          type="search"
          [ngModel]="filters().search ?? ''"
          (ngModelChange)="patch({ search: $event || undefined })"
          placeholder="Search products…"
        />
      </div>

      <!-- Category -->
      @if (categories().length) {
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--mox-muted)">Category</p>
          <select
            class="mox-input"
            [ngModel]="filters().category ?? ''"
            (ngModelChange)="patch({ category: $event || undefined })"
          >
            <option value="">All categories</option>
            @for (c of categories(); track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </div>
      }

      <!-- Brand -->
      @if (brands().length) {
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--mox-muted)">Brand</p>
          <select
            class="mox-input"
            [ngModel]="filters().brand ?? ''"
            (ngModelChange)="patch({ brand: $event || undefined })"
          >
            <option value="">All brands</option>
            @for (b of brands(); track b) {
              <option [value]="b">{{ b }}</option>
            }
          </select>
        </div>
      }

      <!-- Price range -->
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide" style="color:var(--mox-muted)">Price</p>
        <div class="flex items-center gap-2">
          <input
            class="mox-input"
            type="number"
            min="0"
            placeholder="Min"
            [ngModel]="filters().minPrice ?? ''"
            (ngModelChange)="patch({ minPrice: $event === '' ? undefined : +$event })"
          />
          <span style="color:var(--mox-muted)">–</span>
          <input
            class="mox-input"
            type="number"
            min="0"
            placeholder="Max"
            [ngModel]="filters().maxPrice ?? ''"
            (ngModelChange)="patch({ maxPrice: $event === '' ? undefined : +$event })"
          />
        </div>
      </div>

      <!-- Toggles -->
      <div class="space-y-2 border-t pt-4" style="border-color:var(--mox-border)">
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            class="accent-[var(--mox-accent)]"
            [checked]="!!filters().inStock"
            (change)="patch({ inStock: castEvent($event) || undefined })"
          />
          <span>In stock only</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            class="accent-[var(--mox-accent)]"
            [checked]="!!filters().onSale"
            (change)="patch({ onSale: castEvent($event) || undefined })"
          />
          <span>On sale only</span>
        </label>
      </div>

      <!-- Clear -->
      @if (hasActiveFilters()) {
        <button
          type="button"
          class="mox-btn mox-btn--outline w-full text-xs"
          (click)="clear()"
        >
          Clear filters
        </button>
      }
    </div>
  `
})
export class ProductFiltersComponent {
  readonly filters = input.required<ProductListFilters>();
  readonly categories = input<string[]>([]);
  readonly brands = input<string[]>([]);
  readonly filtersChange = output<ProductListFilters>();

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.search || f.category || f.brand || f.minPrice != null || f.maxPrice != null || f.inStock || f.onSale);
  }

  patch(partial: Partial<ProductListFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...partial, page: 1 });
  }

  clear(): void {
    this.filtersChange.emit({ page: 1, pageSize: this.filters().pageSize ?? 12, sort: this.filters().sort });
  }

  castEvent(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
