import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductListFilters } from '../models/product.model';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="product-filters pf-glass-card grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-5">
      <label class="block space-y-1 lg:col-span-2">
        <span class="pf-text-muted text-xs font-medium uppercase tracking-wide">Search</span>
        <input
          class="pf-editor-input w-full"
          type="search"
          [ngModel]="filters().search ?? ''"
          (ngModelChange)="patch({ search: $event })"
          placeholder="Search products…"
        />
      </label>
      <label class="block space-y-1">
        <span class="pf-text-muted text-xs font-medium uppercase tracking-wide">Category</span>
        <select
          class="pf-editor-input w-full"
          [ngModel]="filters().category ?? ''"
          (ngModelChange)="patch({ category: $event || undefined })"
        >
          <option value="">All categories</option>
          @for (c of categories(); track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
      </label>
      <label class="block space-y-1">
        <span class="pf-text-muted text-xs font-medium uppercase tracking-wide">Brand</span>
        <select
          class="pf-editor-input w-full"
          [ngModel]="filters().brand ?? ''"
          (ngModelChange)="patch({ brand: $event || undefined })"
        >
          <option value="">All brands</option>
          @for (b of brands(); track b) {
            <option [value]="b">{{ b }}</option>
          }
        </select>
      </label>
      <div class="grid grid-cols-2 gap-2">
        <label class="block space-y-1">
          <span class="pf-text-muted text-xs font-medium uppercase tracking-wide">Min</span>
          <input
            class="pf-editor-input w-full"
            type="number"
            min="0"
            [ngModel]="filters().minPrice ?? ''"
            (ngModelChange)="patch({ minPrice: $event === '' ? undefined : +$event })"
          />
        </label>
        <label class="block space-y-1">
          <span class="pf-text-muted text-xs font-medium uppercase tracking-wide">Max</span>
          <input
            class="pf-editor-input w-full"
            type="number"
            min="0"
            [ngModel]="filters().maxPrice ?? ''"
            (ngModelChange)="patch({ maxPrice: $event === '' ? undefined : +$event })"
          />
        </label>
      </div>
    </div>
  `
})
export class ProductFiltersComponent {
  readonly filters = input.required<ProductListFilters>();
  readonly categories = input<string[]>([]);
  readonly brands = input<string[]>([]);
  readonly filtersChange = output<ProductListFilters>();

  patch(partial: Partial<ProductListFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...partial, page: 1 });
  }
}
