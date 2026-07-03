import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Star } from 'lucide-angular';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';
import { productDiscountPercent, catalogPrimaryImage } from '../models/product.model';
import { CartStateService } from '../data-access/cart-state.service';

/**
 * Minishop product card: vertical rotated sale badge, 1s image zoom + accent overlay fade,
 * hover-revealed split "Add to cart" / "Buy now" action bar, 5-star outline row, uppercase title.
 * All content (name, price, category/brand overline, sale state) comes from CatalogProductListItemDto —
 * nothing here is hardcoded.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LucideAngularModule],
  template: `
    <article class="msp-card">
      <a [routerLink]="productLink()" class="msp-card__media" [attr.aria-label]="product().name">
        <img [src]="imageUrl()" [alt]="product().name" loading="lazy" />
        @if (discount(); as d) {
          <span class="msp-card__badge">{{ d }}% Off</span>
        }
        <div class="msp-card__actions" (click)="$event.stopPropagation()">
          <button type="button" class="msp-card__action msp-card__action--cart" (click)="addToCart($event)">
            Add to cart
          </button>
          <button type="button" class="msp-card__action msp-card__action--buy" (click)="buyNow($event)">
            Buy now
          </button>
        </div>
      </a>

      <div class="msp-card__body">
        @if (overline()) {
          <p class="msp-card__overline">{{ overline() }}</p>
        }
        <div class="msp-card__stars" aria-hidden="true">
          @for (i of stars; track i) {
            <lucide-icon [img]="starIcon" class="msp-card__star" />
          }
        </div>
        <a [routerLink]="productLink()" class="msp-card__title">{{ product().name }}</a>
        <div class="msp-card__price-row">
          @if (discount()) {
            <span class="msp-card__compare">{{ product().compareAtPrice | currency: 'USD' }}</span>
          }
          <span class="msp-card__price">{{ product().price | currency: 'USD' }}</span>
        </div>
      </div>
    </article>
  `,
  styles: `
    .msp-card {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--mox-surface, #fff);
      transition: box-shadow 0.3s ease;
    }
    .msp-card:hover {
      box-shadow: 0 7px 15px -5px rgba(0, 0, 0, 0.07);
    }

    .msp-card__media {
      position: relative;
      display: block;
      aspect-ratio: 1 / 1.1;
      overflow: hidden;
      background: color-mix(in srgb, var(--mox-border, #eaeaea) 30%, var(--mox-surface, #fff));
    }
    .msp-card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1);
      transition: transform 1s ease;
    }
    .msp-card:hover .msp-card__media img {
      transform: scale(1.1);
    }
    .msp-card__media::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--mox-accent, #dbcc8f);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .msp-card:hover .msp-card__media::after {
      opacity: 0.12;
    }

    .msp-card__badge {
      position: absolute;
      top: 0;
      left: 1rem;
      z-index: 2;
      padding: 0.6rem 0.35rem;
      background: var(--mox-accent, #dbcc8f);
      color: #000;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }

    .msp-card__actions {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      transform: translateY(100%);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
      z-index: 2;
    }
    .msp-card:hover .msp-card__actions {
      transform: translateY(0);
      opacity: 1;
    }
    .msp-card__action {
      flex: 1 1 50%;
      padding: 0.75rem 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: none;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .msp-card__action--cart {
      background: #000;
      color: #fff;
    }
    .msp-card__action--cart:hover {
      background: var(--mox-accent, #dbcc8f);
      color: #000;
    }
    .msp-card__action--buy {
      background: #fff;
      color: #000;
    }
    .msp-card__action--buy:hover {
      background: var(--mox-accent, #dbcc8f);
    }

    .msp-card__body {
      padding: 1rem 0.25rem 0;
    }
    .msp-card__overline {
      margin: 0 0 0.3rem;
      font-size: 0.72rem;
      color: var(--mox-muted, #8a8a8a);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .msp-card__stars {
      display: flex;
      gap: 0.15rem;
      margin-bottom: 0.4rem;
      color: var(--mox-accent, #dbcc8f);
    }
    .msp-card__star {
      width: 0.8rem;
      height: 0.8rem;
    }
    .msp-card__title {
      display: block;
      margin: 0 0 0.4rem;
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--mox-text, #23232d);
      text-decoration: none;
    }
    .msp-card__title:hover {
      color: var(--mox-accent, #dbcc8f);
    }
    .msp-card__price-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .msp-card__price {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--mox-text, #23232d);
    }
    .msp-card__compare {
      font-size: 0.8rem;
      color: var(--mox-muted, #8a8a8a);
      text-decoration: line-through;
    }
  `
})
export class ProductCardComponent {
  readonly product = input.required<CatalogProductListItemDto>();
  readonly storeSlug = input.required<string>();

  readonly starIcon = Star;
  readonly stars = [1, 2, 3, 4, 5];

  private readonly cart = inject(CartStateService);
  private readonly router = inject(Router);

  readonly imageUrl = computed(() => catalogPrimaryImage(this.product()));
  readonly overline = computed(() => this.product().brandName || this.product().tags[0] || '');
  discount = () => productDiscountPercent(this.product());

  productLink(): string[] {
    return ['/store', this.storeSlug(), 'products', this.product().slug];
  }

  addToCart(event: Event): void {
    event.preventDefault();
    this.cart.addListItem(this.product(), 1);
  }

  buyNow(event: Event): void {
    event.preventDefault();
    this.cart.addListItem(this.product(), 1);
    this.router.navigate(['/store', this.storeSlug(), 'checkout']);
  }
}
