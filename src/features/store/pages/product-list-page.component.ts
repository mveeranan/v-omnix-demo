import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StoreContextService } from '../data-access/store-context.service';
import { ProductApiService } from '../data-access/product-api.service';
import { ProductListFilters, ProductListResult, ProductSortOption } from '../models/product.model';
import { ProductFiltersComponent } from '../commerce/product-filters.component';
import { ProductCardComponent } from '../commerce/product-card.component';
import { PaginationComponent } from '@shared/ui/pagination.component';
import { AppEmptyStateComponent } from '@shared/ui/app-empty-state.component';
import { Package } from 'lucide-angular';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [ProductFiltersComponent, ProductCardComponent, PaginationComponent, AppEmptyStateComponent],
  template: `
    <div class="container mx-auto px-6 py-10">
      <div class="mb-8 text-center md:text-left">
        <p class="mox-hero__eyebrow">Shop</p>
        <h1 class="mox-sale-section__title">All products</h1>
        <p class="mox-sale-section__subtitle mt-2">Browse the full catalog, add to cart, and checkout securely.</p>
      </div>

      <div class="mox-shop-layout">
        <aside class="mox-shop-sidebar hidden lg:block">
          <app-product-filters
            [filters]="filters()"
            [categories]="result()?.categories ?? []"
            [brands]="result()?.brands ?? []"
            (filtersChange)="onFiltersChange($event)"
          />
        </aside>

        <div>
      <div class="mb-4 lg:hidden">
        <app-product-filters
          [filters]="filters()"
          [categories]="result()?.categories ?? []"
          [brands]="result()?.brands ?? []"
          (filtersChange)="onFiltersChange($event)"
        />
      </div>

      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p class="text-sm text-[var(--text-muted)]">
          Showing {{ rangeStart() }}-{{ rangeEnd() }} of {{ result()?.total ?? 0 }} products
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <select class="pf-editor-input text-sm" [value]="filters().sort ?? 'popular'" (change)="onSort($event)">
            @for (opt of sortOptions; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <select class="pf-editor-input text-sm" [value]="filters().pageSize ?? 12" (change)="onPageSize($event)">
            <option [value]="12">12 per page</option>
            <option [value]="24">24 per page</option>
            <option [value]="48">48 per page</option>
          </select>
          <button type="button" class="admin-action-secondary rounded px-2 py-1 text-sm" (click)="viewMode.set('grid')">Grid</button>
          <button type="button" class="admin-action-secondary rounded px-2 py-1 text-sm" (click)="viewMode.set('list')">List</button>
        </div>
      </div>

      <label class="mb-4 flex items-center gap-2 text-sm">
        <input type="checkbox" [checked]="!!filters().inStock" (change)="toggleInStock($event)" /> In stock only
      </label>
      <label class="mb-4 ml-4 flex items-center gap-2 text-sm">
        <input type="checkbox" [checked]="!!filters().onSale" (change)="toggleOnSale($event)" /> On sale only
      </label>

      @if (loading()) {
        <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="pf-glass-card h-72 animate-pulse rounded-xl"></div>
          }
        </div>
      } @else if (result()?.items?.length) {
        <div class="mt-4 grid gap-6" [class.sm:grid-cols-2]="viewMode() === 'grid'" [class.lg:grid-cols-3]="viewMode() === 'grid'" [class.xl:grid-cols-4]="viewMode() === 'grid'" [class.grid-cols-1]="viewMode() === 'list'">
          @for (product of result()!.items; track product.id) {
            <app-product-card
              [product]="product"
              [storeSlug]="ctx.slug()"
              [promoMarquee]="promoMarquee()"
              [showQtyControls]="showQtyControls()"
            />
          }
        </div>
        <div class="mt-10 pb-6">
          <app-pagination
            [total]="result()!.total"
            [page]="filters().page ?? 1"
            [pageSize]="filters().pageSize ?? 12"
            [showGoto]="true"
            (pageChange)="goToPage($event)"
          />
        </div>
      } @else {
        <app-empty-state title="No products found" description="Try clearing your filters or search." [icon]="packageIcon">
          <button type="button" class="admin-action-secondary mt-4 rounded-lg px-4 py-2 text-sm" (click)="clearFilters()">Clear filters</button>
        </app-empty-state>
      }
        </div>
      </div>
    </div>
  `
})
export class ProductListPageComponent implements OnInit {
  readonly ctx = inject(StoreContextService);
  private readonly productApi = inject(ProductApiService);
  readonly packageIcon = Package;

  readonly filters = signal<ProductListFilters>({ page: 1, pageSize: 12, sort: 'popular' });
  readonly result = signal<ProductListResult | null>(null);
  readonly loading = signal(true);
  readonly viewMode = signal<'grid' | 'list'>('grid');

  readonly sortOptions: { value: ProductSortOption; label: string }[] = [
    { value: 'popular', label: 'Most popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: low to high' },
    { value: 'price-desc', label: 'Price: high to low' },
    { value: 'rating', label: 'Highest rated' },
    { value: 'reviews', label: 'Most reviews' }
  ];

  readonly promoMarquee = computed(
    () => this.ctx.portfolio()?.featuredProducts.promoMarqueeText?.trim() || ''
  );
  readonly showQtyControls = computed(
    () => this.ctx.portfolio()?.featuredProducts.showQtyControls ?? true
  );

  readonly rangeStart = computed(() => {
    const r = this.result();
    if (!r || !r.total) return 0;
    return (r.page - 1) * r.pageSize + 1;
  });

  readonly rangeEnd = computed(() => {
    const r = this.result();
    if (!r) return 0;
    return Math.min(r.page * r.pageSize, r.total);
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productApi.listByStore(this.ctx.slug(), this.filters()).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFiltersChange(partial: ProductListFilters): void {
    this.filters.update((f) => ({ ...f, ...partial, page: 1 }));
    this.load();
  }

  onSort(event: Event): void {
    const sort = (event.target as HTMLSelectElement).value as ProductSortOption;
    this.filters.update((f) => ({ ...f, sort, page: 1 }));
    this.load();
  }

  onPageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    this.filters.update((f) => ({ ...f, pageSize, page: 1 }));
    this.load();
  }

  toggleInStock(event: Event): void {
    const inStock = (event.target as HTMLInputElement).checked;
    this.filters.update((f) => ({ ...f, inStock: inStock || undefined, page: 1 }));
    this.load();
  }

  toggleOnSale(event: Event): void {
    const onSale = (event.target as HTMLInputElement).checked;
    this.filters.update((f) => ({ ...f, onSale: onSale || undefined, page: 1 }));
    this.load();
  }

  goToPage(page: number): void {
    this.filters.update((f) => ({ ...f, page }));
    this.load();
  }

  clearFilters(): void {
    this.filters.set({ page: 1, pageSize: 12, sort: 'popular' });
    this.load();
  }
}
