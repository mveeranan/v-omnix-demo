import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StoreContextService } from '../data-access/store-context.service';
import { ProductApiService } from '../data-access/product-api.service';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogBrandDto, CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';
import { ProductListFilters, ProductListResult, ProductSortOption } from '../models/product.model';
import { ProductCardComponent } from '../commerce/product-card.component';
import { MspShopSidebarComponent, ShopSidebarFilters } from '../shop/msp-shop-sidebar.component';
import { AppEmptyStateComponent } from '@shared/ui/app-empty-state.component';
import { Package } from 'lucide-angular';

/**
 * Minishop shop page: breadcrumb hero → sidebar (category accordion + price range + brand)
 * → 3-col product grid (rebuilt product cards) → circle pagination.
 * Products, categories, and brands all come from the catalog API — nothing hardcoded.
 */
@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, MspShopSidebarComponent, AppEmptyStateComponent],
  template: `
    <section class="msp-shop-hero">
      <div class="msp-shop-hero__overlay"></div>
      <div class="container mx-auto px-6 msp-shop-hero__content">
        <p class="msp-shop-hero__crumb">
          <a [routerLink]="['/store', ctx.slug()]">Home</a>
          <span>/</span>
          <span>Shop</span>
        </p>
        <h1 class="msp-shop-hero__title">Shop</h1>
      </div>
    </section>

    <div class="msp-shop container mx-auto px-6">
      <div class="msp-shop__layout">
        <app-msp-shop-sidebar
          class="msp-shop__sidebar"
          [categories]="categories()"
          [brands]="brands()"
          [selectedCategorySlug]="filters().categorySlug"
          [selectedBrandSlug]="filters().brandSlug"
          [minPrice]="filters().minPrice"
          [maxPrice]="filters().maxPrice"
          [priceCeiling]="priceCeiling()"
          (filtersChange)="onSidebarFiltersChange($event)"
        />

        <div class="msp-shop__main">
          <div class="msp-shop__toolbar">
            <p class="msp-shop__count">
              @if (loading()) {
                Loading…
              } @else {
                Showing {{ rangeStart() }}–{{ rangeEnd() }} of {{ result()?.total ?? 0 }} products
              }
            </p>
            <div class="msp-shop__toolbar-controls">
              <input
                class="msp-shop__search"
                type="search"
                placeholder="Search products…"
                [value]="filters().q ?? ''"
                (change)="onSearch($event)"
              />
              <select class="msp-shop__sort" [value]="filters().sort ?? 'newest'" (change)="onSort($event)">
                @for (opt of sortOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
          </div>

          @if (loading()) {
            <div class="msp-shop__grid">
              @for (i of skeletons; track i) {
                <div class="mox-skeleton h-80 animate-pulse"></div>
              }
            </div>
          } @else if (result()?.items?.length) {
            <div class="msp-shop__grid">
              @for (product of result()!.items; track product.id) {
                <app-product-card [product]="product" [storeSlug]="ctx.slug()" />
              }
            </div>

            @if (result()!.totalPages > 1) {
              <nav class="msp-shop__pagination" aria-label="Shop pagination">
                <button
                  type="button"
                  class="msp-shop__page-btn"
                  [disabled]="(filters().page ?? 1) <= 1"
                  (click)="goToPage((filters().page ?? 1) - 1)"
                >‹</button>
                @for (p of pageNumbers(); track p) {
                  <button
                    type="button"
                    class="msp-shop__page-btn"
                    [class.msp-shop__page-btn--active]="p === (filters().page ?? 1)"
                    (click)="goToPage(p)"
                  >{{ p }}</button>
                }
                <button
                  type="button"
                  class="msp-shop__page-btn"
                  [disabled]="(filters().page ?? 1) >= result()!.totalPages"
                  (click)="goToPage((filters().page ?? 1) + 1)"
                >›</button>
              </nav>
            }
          } @else {
            <app-empty-state
              title="No products found"
              description="Try a different search, category, or price range."
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
  `,
  styles: `
    .msp-shop-hero {
      position: relative;
      padding: 6em 0;
      background: linear-gradient(135deg, #23232d 0%, #000 100%);
      color: #fff;
      text-align: center;
    }
    .msp-shop-hero__overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--mox-accent, #dbcc8f) 18%, transparent), transparent 60%);
    }
    .msp-shop-hero__content { position: relative; }
    .msp-shop-hero__crumb {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
    .msp-shop-hero__crumb a { color: rgba(255, 255, 255, 0.7); text-decoration: none; }
    .msp-shop-hero__crumb a:hover { color: var(--mox-accent, #dbcc8f); }
    .msp-shop-hero__title {
      margin: 0;
      font-size: clamp(1.75rem, 4vw, 2.25rem);
      font-weight: 800;
      text-transform: uppercase;
    }

    .msp-shop { padding: 4rem 0; }
    .msp-shop__layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media (min-width: 992px) {
      .msp-shop__layout { grid-template-columns: 280px 1fr; }
    }

    .msp-shop__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .msp-shop__count { margin: 0; font-size: 0.85rem; color: var(--mox-muted, #808080); }
    .msp-shop__toolbar-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .msp-shop__search,
    .msp-shop__sort {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--mox-border, #d9d9d9);
      background: var(--mox-surface, #fff);
      color: var(--mox-text, #23232d);
      font-size: 0.85rem;
    }

    .msp-shop__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.75rem 1.5rem;
    }
    @media (min-width: 768px) {
      .msp-shop__grid { grid-template-columns: repeat(3, 1fr); }
    }

    .msp-shop__pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 3rem;
    }
    .msp-shop__page-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--mox-border, #d9d9d9);
      background: var(--mox-surface, #fff);
      color: var(--mox-text, #23232d);
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }
    .msp-shop__page-btn:hover:not(:disabled) {
      border-color: #000;
    }
    .msp-shop__page-btn--active {
      background: #000;
      border-color: #000;
      color: #fff;
    }
    .msp-shop__page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `
})
export class ProductListPageComponent implements OnInit {
  readonly ctx = inject(StoreContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApiService);
  private readonly catalogApi = inject(CatalogStorefrontApiService);

  readonly packageIcon = Package;
  readonly skeletons = [1, 2, 3, 4, 5, 6];

  readonly filters = signal<ProductListFilters>({ page: 1, pageSize: 12, sort: 'newest' });
  readonly result = signal<ProductListResult | null>(null);
  readonly categories = signal<CatalogCategoryDto[]>([]);
  readonly brands = signal<CatalogBrandDto[]>([]);
  readonly loading = signal(true);

  readonly priceCeiling = computed(() => {
    const items = this.result()?.items ?? [];
    return items.length ? Math.max(...items.map((p) => p.price)) : 200;
  });

  readonly sortOptions: { value: ProductSortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'bestselling', label: 'Best selling' },
    { value: 'price-asc', label: 'Price: low → high' },
    { value: 'price-desc', label: 'Price: high → low' },
    { value: 'name', label: 'Name A–Z' }
  ];

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

  readonly pageNumbers = computed(() => {
    const total = this.result()?.totalPages ?? 1;
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    const categorySlug = this.route.snapshot.queryParamMap.get('category') ?? undefined;
    const q = this.route.snapshot.queryParamMap.get('q') ?? undefined;
    if (categorySlug || q) {
      this.filters.update((f) => ({ ...f, categorySlug, q }));
    }
    this.loadFacets();
    this.load();
  }

  private loadFacets(): void {
    this.catalogApi.listCategories(this.ctx.slug()).subscribe((c) => this.categories.set(c));
    this.catalogApi.listBrands(this.ctx.slug()).subscribe((b) => this.brands.set(b));
  }

  load(): void {
    this.loading.set(true);
    this.productApi.listByStore(this.ctx.slug(), this.filters()).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSidebarFiltersChange(partial: ShopSidebarFilters): void {
    this.filters.update((f) => ({ ...f, ...partial, page: 1 }));
    this.load();
  }

  onSearch(event: Event): void {
    const q = (event.target as HTMLInputElement).value.trim() || undefined;
    this.filters.update((f) => ({ ...f, q, page: 1 }));
    this.load();
  }

  onSort(event: Event): void {
    const sort = (event.target as HTMLSelectElement).value as ProductSortOption;
    this.filters.update((f) => ({ ...f, sort, page: 1 }));
    this.load();
  }

  goToPage(page: number): void {
    const total = this.result()?.totalPages ?? 1;
    if (page < 1 || page > total) return;
    this.filters.update((f) => ({ ...f, page }));
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.filters.set({ page: 1, pageSize: 12, sort: 'newest' });
    this.load();
  }
}
