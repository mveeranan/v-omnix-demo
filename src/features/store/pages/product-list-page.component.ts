import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    <div class="mox-section">
      <div class="container mx-auto px-6 py-10">

        <!-- Page header -->
        <div class="mb-8">
          <p class="mox-hero__eyebrow">Shop</p>
          <h1 class="mox-sale-section__title">All Products</h1>
          <p class="mt-2" style="color:var(--mox-muted);font-size:0.9375rem">
            Browse the full catalog, add to cart, and checkout securely.
          </p>
        </div>

        <div class="mox-shop-layout">

          <!-- Sidebar filter (desktop) -->
          <aside class="mox-shop-sidebar hidden lg:block">
            <p class="mb-4 text-sm font-bold uppercase tracking-wide" style="color:var(--mox-primary)">Filters</p>
            <app-product-filters
              [filters]="filters()"
              [categories]="result()?.categories ?? []"
              [brands]="result()?.brands ?? []"
              (filtersChange)="onFiltersChange($event)"
            />
          </aside>

          <!-- Main content -->
          <div class="min-w-0">

            <!-- Mobile filter (collapsed row) -->
            <div class="mb-4 lg:hidden">
              <app-product-filters
                [filters]="filters()"
                [categories]="result()?.categories ?? []"
                [brands]="result()?.brands ?? []"
                (filtersChange)="onFiltersChange($event)"
              />
            </div>

            <!-- Toolbar -->
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p class="text-sm" style="color:var(--mox-muted)">
                @if (loading()) {
                  Loading…
                } @else {
                  Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ result()?.total ?? 0 }} products
                }
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <select class="mox-input" style="width:auto;min-width:9rem" [value]="filters().sort ?? 'popular'" (change)="onSort($event)">
                  @for (opt of sortOptions; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                <select class="mox-input" style="width:auto" [value]="filters().pageSize ?? 12" (change)="onPageSize($event)">
                  <option [value]="12">12 / page</option>
                  <option [value]="24">24 / page</option>
                  <option [value]="48">48 / page</option>
                </select>
                <div class="flex rounded overflow-hidden" style="border:1px solid var(--mox-border)">
                  <button
                    type="button"
                    class="px-3 py-1.5 text-sm font-semibold transition-colors"
                    [style.background]="viewMode() === 'grid' ? 'var(--mox-accent)' : 'var(--mox-surface)'"
                    [style.color]="viewMode() === 'grid' ? '#fff' : 'var(--mox-text)'"
                    (click)="viewMode.set('grid')"
                  >Grid</button>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-sm font-semibold transition-colors"
                    [style.background]="viewMode() === 'list' ? 'var(--mox-accent)' : 'var(--mox-surface)'"
                    [style.color]="viewMode() === 'list' ? '#fff' : 'var(--mox-text)'"
                    (click)="viewMode.set('list')"
                  >List</button>
                </div>
              </div>
            </div>

            <!-- Product grid -->
            @if (loading()) {
              <div class="mox-product-grid">
                @for (i of skeletons; track i) {
                  <div class="mox-skeleton h-80 animate-pulse"></div>
                }
              </div>
            } @else if (result()?.items?.length) {
              <div
                class="grid gap-5"
                [class.mox-product-grid]="viewMode() === 'grid'"
                [class.grid-cols-1]="viewMode() === 'list'"
              >
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
              <app-empty-state
                title="No products found"
                description="Try adjusting your filters or search."
                [icon]="packageIcon"
              >
                <button type="button" class="mox-btn mox-btn--outline mt-4 text-sm" (click)="clearFilters()">
                  Clear filters
                </button>
              </app-empty-state>
            }

          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListPageComponent implements OnInit {
  readonly ctx = inject(StoreContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly productApi = inject(ProductApiService);

  readonly packageIcon = Package;
  readonly skeletons = [1, 2, 3, 4, 5, 6, 7, 8];

  readonly filters = signal<ProductListFilters>({ page: 1, pageSize: 12, sort: 'popular' });
  readonly result = signal<ProductListResult | null>(null);
  readonly loading = signal(true);
  readonly viewMode = signal<'grid' | 'list'>('grid');

  readonly sortOptions: { value: ProductSortOption; label: string }[] = [
    { value: 'popular',    label: 'Most popular' },
    { value: 'newest',     label: 'Newest' },
    { value: 'price-asc',  label: 'Price: low → high' },
    { value: 'price-desc', label: 'Price: high → low' },
    { value: 'rating',     label: 'Highest rated' },
    { value: 'reviews',    label: 'Most reviews' }
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
    const category = this.route.snapshot.queryParamMap.get('category');
    if (category) {
      this.filters.update((f) => ({ ...f, category }));
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.productApi.listByStore(this.ctx.slug(), this.filters()).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFiltersChange(partial: ProductListFilters): void {
    this.filters.set({ ...partial, page: 1 });
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

  goToPage(page: number): void {
    this.filters.update((f) => ({ ...f, page }));
    this.load();
  }

  clearFilters(): void {
    this.filters.set({ page: 1, pageSize: 12, sort: 'popular' });
    this.load();
  }
}
