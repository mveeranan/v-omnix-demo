import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { ProductApiService } from '../data-access/product-api.service';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-new-arrivals-section',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    @if (portfolio().newArrivals.enabled) {
      <section class="mox-section" id="new-arrivals">
        <div class="container mx-auto px-6">
          <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="mox-hero__eyebrow">Just landed</p>
              <h2 class="mox-sale-section__title">{{ portfolio().newArrivals.title }}</h2>
            </div>
            <a [routerLink]="['/store', storeSlug(), 'products']" class="mox-btn mox-btn--outline text-sm">View all</a>
          </header>

          @if (loading()) {
            <div class="mox-product-grid">
              @for (i of skeletons; track i) {
                <div class="mox-product-card mox-skeleton h-80 animate-pulse"></div>
              }
            </div>
          } @else if (products().length) {
            <div class="mox-product-grid">
              @for (product of products(); track product.id) {
                <app-product-card
                  [product]="product"
                  [storeSlug]="storeSlug()"
                  [showQtyControls]="false"
                />
              }
            </div>
          } @else {
            <p class="mox-sale-section__subtitle text-center py-8">No products yet — check back soon.</p>
          }
        </div>
      </section>
    }
  `
})
export class NewArrivalsSectionComponent implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();

  private readonly productApi = inject(ProductApiService);
  readonly products = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);
  readonly skeletons = [1, 2, 3, 4];

  ngOnInit(): void {
    if (!this.portfolio().newArrivals.enabled) {
      this.loading.set(false);
      return;
    }
    const max = this.portfolio().newArrivals.maxCount || 8;
    this.productApi.listByStore(this.storeSlug(), { page: 1, pageSize: max, sort: 'newest' }).subscribe({
      next: (res) => {
        this.products.set(res.items ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
