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
      <section class="msp-arrivals" id="new-arrivals">
        <div class="container mx-auto px-6">
          <header class="msp-section-head">
            <p class="msp-section-head__eyebrow">Just landed</p>
            <h2 class="msp-section-head__title">{{ portfolio().newArrivals.title }}</h2>
            <span class="msp-section-head__rule" aria-hidden="true"></span>
          </header>

          @if (loading()) {
            <div class="msp-arrivals__grid">
              @for (i of skeletons; track i) {
                <div class="mox-skeleton h-80 animate-pulse"></div>
              }
            </div>
          } @else if (products().length) {
            <div class="msp-arrivals__grid">
              @for (product of products(); track product.id) {
                <app-product-card
                  [product]="product"
                  [storeSlug]="storeSlug()"
                  [showQtyControls]="false"
                />
              }
            </div>
            <div class="msp-arrivals__more">
              <a [routerLink]="['/store', storeSlug(), 'products']" class="msp-arrivals__more-btn">View all products</a>
            </div>
          } @else {
            <p class="msp-section-head__subtitle text-center py-8">No products yet — check back soon.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .msp-arrivals { padding: 4rem 0; background: var(--mox-bg, #fff); }

    .msp-section-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .msp-section-head__eyebrow {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: var(--mox-accent, #fe4c50);
    }
    .msp-section-head__title {
      margin: 0;
      font-family: var(--mox-font-heading, inherit);
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      color: var(--mox-text, #23232d);
    }
    .msp-section-head__rule {
      width: 3.5rem;
      height: 3px;
      background: var(--mox-accent, #fe4c50);
      border-radius: 999px;
    }
    .msp-section-head__subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: var(--mox-muted, #8a8a8a);
    }

    .msp-arrivals__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
    @media (min-width: 768px) {
      .msp-arrivals__grid { grid-template-columns: repeat(4, 1fr); }
    }

    .msp-arrivals__more {
      display: flex;
      justify-content: center;
      margin-top: 2.25rem;
    }
    .msp-arrivals__more-btn {
      display: inline-flex;
      padding: 0.75rem 2.2rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mox-accent, #fe4c50);
      background: transparent;
      border: 2px solid var(--mox-accent, #fe4c50);
      border-radius: var(--mox-btn-radius, 2px);
      text-decoration: none;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .msp-arrivals__more-btn:hover {
      background: var(--mox-accent, #fe4c50);
      color: #fff;
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
