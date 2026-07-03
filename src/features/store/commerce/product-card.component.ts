import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShoppingCart, Check } from 'lucide-angular';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';
import {
  productDiscountPercent,
  catalogPrimaryImage
} from '../models/product.model';
import { CartStateService } from '../data-access/cart-state.service';

/**
 * Minishop-style product card: image-dominant white card, sale badge,
 * hover "Add to Cart" reveal, centered body. All colors come from the
 * store theme CSS variables so tenant themes apply automatically.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LucideAngularModule],
  template: `
    <article class="msp-card">
      <div class="msp-card__media-wrap">
        @if (discount(); as d) {
          <span class="msp-card__badge">-{{ d }}%</span>
        }
        <a [routerLink]="productLink()" class="msp-card__media">
          <img [src]="imageUrl()" [alt]="product().name" loading="lazy" />
        </a>
        <button type="button" class="msp-card__add" (click)="addToCart()">
          <lucide-icon [img]="added() ? checkIcon : cartIcon" class="h-4 w-4" />
          <span>{{ added() ? 'Added!' : 'Add to Cart' }}</span>
        </button>
      </div>

      <div class="msp-card__body">
        @if (product().brandName) {
          <p class="msp-card__brand">{{ product().brandName }}</p>
        }
        <a [routerLink]="productLink()" class="msp-card__title">{{ product().name }}</a>
        <div class="msp-card__price-row">
          <span class="msp-card__price">{{ product().price | currency: 'USD' }}</span>
          @if (product().compareAtPrice && product().compareAtPrice! > product().price) {
            <span class="msp-card__compare">{{ product().compareAtPrice | currency: 'USD' }}</span>
          }
        </div>
        @if (showQtyControls()) {
          <div class="msp-card__qty">
            <button type="button" class="msp-card__qty-btn" (click)="decrement()" [disabled]="qty() <= 1">−</button>
            <span class="msp-card__qty-val">{{ qty() }}</span>
            <button type="button" class="msp-card__qty-btn" (click)="increment()">+</button>
          </div>
        }
      </div>

      @if (promoMarquee()) {
        <div class="msp-card__marquee-wrap" aria-hidden="true">
          <div class="msp-card__marquee">
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
          </div>
        </div>
      }
    </article>
  `,
  styles: `
    .msp-card {
      display: flex;
      flex-direction: column;
      background: var(--mox-surface, #fff);
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-radius, 4px);
      overflow: hidden;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    .msp-card:hover {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    .msp-card__media-wrap {
      position: relative;
      overflow: hidden;
      background: color-mix(in srgb, var(--mox-border, #eaeaea) 30%, var(--mox-surface, #fff));
    }
    .msp-card__media {
      display: block;
      aspect-ratio: 1 / 1;
    }
    .msp-card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .msp-card:hover .msp-card__media img {
      transform: scale(1.05);
    }

    .msp-card__badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      z-index: 2;
      padding: 0.2rem 0.55rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: #fff;
      background: var(--mox-sale, var(--mox-accent, #fe4c50));
      border-radius: var(--mox-btn-radius, 2px);
    }

    .msp-card__add {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.7rem 1rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #fff;
      background: var(--mox-accent, #fe4c50);
      border: none;
      cursor: pointer;
      transform: translateY(100%);
      opacity: 0;
      transition: transform 0.28s ease, opacity 0.28s ease, background 0.2s ease;
    }
    .msp-card:hover .msp-card__add,
    .msp-card__add:focus-visible {
      transform: translateY(0);
      opacity: 1;
    }
    .msp-card__add:hover {
      background: color-mix(in srgb, var(--mox-accent, #fe4c50) 85%, #000);
    }
    /* Touch devices: always show the add button */
    @media (hover: none) {
      .msp-card__add {
        position: static;
        transform: none;
        opacity: 1;
      }
    }

    .msp-card__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      padding: 1rem 0.9rem 1.15rem;
      text-align: center;
    }
    .msp-card__brand {
      margin: 0;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mox-muted, #8a8a8a);
    }
    .msp-card__title {
      font-family: var(--mox-font-heading, inherit);
      font-size: 0.95rem;
      font-weight: 600;
      line-height: 1.35;
      color: var(--mox-text, #23232d);
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .msp-card__title:hover {
      color: var(--mox-accent, #fe4c50);
    }
    .msp-card__price-row {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-top: 0.15rem;
    }
    .msp-card__price {
      font-size: 1rem;
      font-weight: 700;
      color: var(--mox-accent, #fe4c50);
    }
    .msp-card__compare {
      font-size: 0.82rem;
      color: var(--mox-muted, #8a8a8a);
      text-decoration: line-through;
    }

    .msp-card__qty {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-top: 0.4rem;
    }
    .msp-card__qty-btn {
      width: 1.7rem;
      height: 1.7rem;
      display: grid;
      place-items: center;
      font-size: 1rem;
      line-height: 1;
      color: var(--mox-text, #23232d);
      background: transparent;
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-btn-radius, 2px);
      cursor: pointer;
      transition: border-color 0.2s ease, color 0.2s ease;
    }
    .msp-card__qty-btn:hover:not(:disabled) {
      border-color: var(--mox-accent, #fe4c50);
      color: var(--mox-accent, #fe4c50);
    }
    .msp-card__qty-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .msp-card__qty-val {
      min-width: 1.2rem;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--mox-text, #23232d);
    }

    .msp-card__marquee-wrap {
      overflow: hidden;
      border-top: 1px solid var(--mox-border, #eaeaea);
      background: color-mix(in srgb, var(--mox-accent, #fe4c50) 8%, var(--mox-surface, #fff));
    }
    .msp-card__marquee {
      display: flex;
      gap: 2rem;
      padding: 0.35rem 0;
      white-space: nowrap;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--mox-accent, #fe4c50);
      animation: msp-marquee 14s linear infinite;
    }
    @keyframes msp-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
  `
})
export class ProductCardComponent {
  readonly product = input.required<CatalogProductListItemDto>();
  readonly storeSlug = input.required<string>();
  readonly promoMarquee = input('');
  readonly showQtyControls = input(true);

  readonly cartIcon = ShoppingCart;
  readonly checkIcon = Check;

  private readonly cart = inject(CartStateService);
  readonly qty = signal(1);
  readonly added = signal(false);

  readonly imageUrl = computed(() => catalogPrimaryImage(this.product()));
  discount = () => productDiscountPercent(this.product());

  productLink(): string[] {
    return ['/store', this.storeSlug(), 'products', this.product().slug];
  }

  addToCart(): void {
    this.cart.addListItem(this.product(), this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }

  increment(): void {
    this.qty.update((q) => q + 1);
  }

  decrement(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }
}
