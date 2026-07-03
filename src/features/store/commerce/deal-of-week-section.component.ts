import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogDealOfWeekDto, catalogPrimaryImage, catalogDiscountPercent } from '@features/catalog/models/catalog-storefront.model';
import { StoreContextService } from '../data-access/store-context.service';
import { CartStateService } from '../data-access/cart-state.service';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';

interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

/** Minishop "Deal of the Month": full-bleed accent bg, product image left, countdown + CTA right. */
@Component({
  selector: 'app-deal-of-week-section',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ScrollRevealDirective],
  template: `
    @if (deal(); as d) {
      <section class="msp-deal">
        <div class="container mx-auto px-6 msp-deal__grid">
          <div class="msp-deal__media" appScrollReveal="slide-right">
            <img [src]="imageUrl()" [alt]="d.product!.name" loading="lazy" />
          </div>
          <div class="msp-deal__content" appScrollReveal="slide-left" [appScrollRevealDelay]="120">
            <p class="msp-deal__eyebrow">{{ d.badgeText || 'Deal Of The Month' }}</p>
            <h2 class="msp-deal__title">{{ d.title || d.product!.name }}</h2>

            <div class="msp-deal__countdown">
              <div class="msp-deal__unit">
                <span class="msp-deal__num">{{ countdown().days }}</span>
                <span class="msp-deal__label">Days</span>
              </div>
              <div class="msp-deal__unit">
                <span class="msp-deal__num">{{ countdown().hours }}</span>
                <span class="msp-deal__label">Hours</span>
              </div>
              <div class="msp-deal__unit">
                <span class="msp-deal__num">{{ countdown().minutes }}</span>
                <span class="msp-deal__label">Mins</span>
              </div>
              <div class="msp-deal__unit">
                <span class="msp-deal__num">{{ countdown().seconds }}</span>
                <span class="msp-deal__label">Secs</span>
              </div>
            </div>

            <a [routerLink]="productLink()" class="msp-deal__product-link">{{ d.product!.name }}</a>
            <div class="msp-deal__price-row">
              @if (discount(); as disc) {
                <span class="msp-deal__compare">{{ d.product!.compareAtPrice | currency: 'USD' }}</span>
                <span class="msp-deal__badge">{{ disc }}% Off</span>
              }
              <span class="msp-deal__price">{{ d.product!.price | currency: 'USD' }}</span>
            </div>

            <button type="button" class="msp-deal__cta" (click)="addToCart()">Add to cart</button>
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .msp-deal {
      padding: 7em 0;
      background: var(--mox-accent, #dbcc8f);
    }
    .msp-deal__grid {
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      gap: 2.5rem;
    }
    @media (min-width: 992px) {
      .msp-deal__grid { grid-template-columns: 1fr 1fr; }
    }
    .msp-deal__media {
      display: flex;
      justify-content: center;
    }
    .msp-deal__media img {
      max-width: 100%;
      max-height: 26rem;
      object-fit: contain;
      animation: msp-deal-float 4s ease-in-out infinite;
    }
    @keyframes msp-deal-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .msp-deal__media img { animation: none; }
    }
    .msp-deal__eyebrow {
      margin: 0 0 0.75rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #000;
    }
    .msp-deal__title {
      margin: 0 0 1.5rem;
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      font-weight: 700;
      text-transform: uppercase;
      color: #000;
    }
    .msp-deal__countdown {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .msp-deal__unit {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .msp-deal__num {
      font-size: 2.4rem;
      font-weight: 700;
      color: #fff;
    }
    .msp-deal__label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(0, 0, 0, 0.6);
    }
    .msp-deal__product-link {
      display: inline-block;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #000;
      text-decoration: none;
    }
    .msp-deal__product-link:hover { text-decoration: underline; }
    .msp-deal__price-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
    }
    .msp-deal__compare {
      font-size: 0.95rem;
      text-decoration: line-through;
      color: rgba(0, 0, 0, 0.5);
    }
    .msp-deal__price {
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
    }
    .msp-deal__badge {
      padding: 0.15rem 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      background: #000;
      color: var(--mox-accent, #dbcc8f);
      text-transform: uppercase;
    }
    .msp-deal__cta {
      padding: 0.85rem 2.2rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #fff;
      background: #000;
      border: none;
      border-radius: var(--mox-btn-radius, 999px);
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .msp-deal__cta:hover { opacity: 0.85; }
  `
})
export class DealOfWeekSectionComponent implements OnInit, OnDestroy {
  private readonly catalogApi = inject(CatalogStorefrontApiService);
  private readonly ctx = inject(StoreContextService);
  private readonly cart = inject(CartStateService);

  private readonly dealDto = signal<CatalogDealOfWeekDto | null>(null);
  private tickTimer?: ReturnType<typeof setInterval>;
  private readonly now = signal(Date.now());

  readonly deal = computed(() => {
    const d = this.dealDto();
    return d?.enabled && d.product ? d : null;
  });

  readonly imageUrl = computed(() => {
    const d = this.deal();
    return d?.product ? catalogPrimaryImage(d.product) : '';
  });

  readonly discount = computed(() => {
    const d = this.deal();
    return d?.product ? catalogDiscountPercent(d.product) : null;
  });

  readonly countdown = computed((): CountdownParts => {
    const d = this.deal();
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (!d?.endDateUtc) return { days: '00', hours: '00', minutes: '00', seconds: '00' };

    const diff = Math.max(0, new Date(d.endDateUtc).getTime() - this.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days: pad(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
  });

  ngOnInit(): void {
    this.catalogApi.getDealOfWeek(this.ctx.slug()).subscribe({
      next: (dto) => this.dealDto.set(dto),
      error: () => this.dealDto.set(null)
    });
    this.tickTimer = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
  }

  productLink(): string[] {
    const d = this.deal();
    return ['/store', this.ctx.slug(), 'products', d!.product!.slug];
  }

  addToCart(): void {
    const d = this.deal();
    if (d?.product) this.cart.addListItem(d.product, 1);
  }
}
