import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Star } from 'lucide-angular';
import { StoreProduct, productDiscountPercent, productInStock } from '../models/product.model';
import { CartStateService } from '../data-access/cart-state.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LucideAngularModule],
  template: `
    <article class="mk-product-card">
      <a [routerLink]="productLink()" class="mk-product-card__media block">
        <img [src]="product().imageUrl" [alt]="product().name" loading="lazy" />
        @if (variantCount() > 1) {
          <span class="mk-product-card__variant-badge">+{{ variantCount() - 1 }}</span>
        }
      </a>
      <div class="mk-product-card__body">
        <div class="mk-product-card__rating">
          <lucide-icon [img]="starIcon" class="h-3.5 w-3.5 fill-current" />
          <span>4.5</span>
        </div>
        <a [routerLink]="productLink()" class="mk-product-card__title">{{ product().name }}</a>
        <div class="mk-product-card__price-row">
          <span class="mk-product-card__price">{{ product().price | currency: product().currency }}</span>
          @if (product().compareAtPrice && product().compareAtPrice! > product().price) {
            <span class="mk-product-card__compare">{{ product().compareAtPrice | currency: product().currency }}</span>
            @if (discount(); as d) {
              <span class="mk-product-card__off">{{ d }}% Off</span>
            }
          }
        </div>
      </div>
      @if (promoMarquee()) {
        <div class="mk-product-card__marquee-wrap" aria-hidden="true">
          <div class="mk-product-card__marquee">
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
          </div>
        </div>
      }
      @if (showQtyControls()) {
        <div class="mk-product-card__qty">
          <button type="button" class="mk-product-card__qty-btn" (click)="decrement()" [disabled]="qty() <= 1">−</button>
          <span class="mk-product-card__qty-val">{{ qty() }}</span>
          <button type="button" class="mk-product-card__qty-btn" (click)="increment()" [disabled]="!inStock()">+</button>
        </div>
      }
    </article>
  `
})
export class ProductCardComponent {
  readonly product = input.required<StoreProduct>();
  readonly storeSlug = input.required<string>();
  readonly promoMarquee = input('');
  readonly showQtyControls = input(true);
  readonly starIcon = Star;

  private readonly cart = inject(CartStateService);
  readonly qty = signal(1);

  variantCount = () => Math.max(1, this.product().variants.length || 1);
  discount = () => productDiscountPercent(this.product());
  inStock = () => productInStock(this.product());

  productLink(): string[] {
    return ['/store', this.storeSlug(), 'products', this.product().slug];
  }

  increment(): void {
    if (!this.inStock()) return;
    this.qty.update((q) => q + 1);
    this.cart.addProduct(this.product());
  }

  decrement(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }
}
