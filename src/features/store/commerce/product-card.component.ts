import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Star } from 'lucide-angular';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';
import {
  productDiscountPercent,
  catalogPrimaryImage
} from '../models/product.model';
import { CartStateService } from '../data-access/cart-state.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, LucideAngularModule],
  template: `
    <article class="mox-product-card">
      <a [routerLink]="productLink()" class="mox-product-card__media block">
        <img [src]="imageUrl()" [alt]="product().name" loading="lazy" />
      </a>
      <div class="mox-product-card__body">
        <div class="mox-product-card__rating">
          <lucide-icon [img]="starIcon" class="h-3.5 w-3.5 fill-current" />
          <span>4.5</span>
        </div>
        <a [routerLink]="productLink()" class="mox-product-card__title">{{ product().name }}</a>
        <div class="mox-product-card__price-row">
          <span class="mox-product-card__price">{{ product().price | currency: 'USD' }}</span>
          @if (product().compareAtPrice && product().compareAtPrice! > product().price) {
            <span class="mox-product-card__compare">{{ product().compareAtPrice | currency: 'USD' }}</span>
            @if (discount(); as d) {
              <span class="mox-product-card__off">{{ d }}% Off</span>
            }
          }
        </div>
      </div>
      @if (promoMarquee()) {
        <div class="mox-product-card__marquee-wrap" aria-hidden="true">
          <div class="mox-product-card__marquee">
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
            <span>{{ promoMarquee() }}</span>
          </div>
        </div>
      }
      @if (showQtyControls()) {
        <div class="mox-product-card__qty">
          <button type="button" class="mox-product-card__qty-btn" (click)="decrement()" [disabled]="qty() <= 1">−</button>
          <span class="mox-product-card__qty-val">{{ qty() }}</span>
          <button type="button" class="mox-product-card__qty-btn" (click)="increment()">+</button>
        </div>
      }
    </article>
  `
})
export class ProductCardComponent {
  readonly product = input.required<CatalogProductListItemDto>();
  readonly storeSlug = input.required<string>();
  readonly promoMarquee = input('');
  readonly showQtyControls = input(true);
  readonly starIcon = Star;

  private readonly cart = inject(CartStateService);
  readonly qty = signal(1);

  readonly imageUrl = computed(() => catalogPrimaryImage(this.product()));
  discount = () => productDiscountPercent(this.product());

  productLink(): string[] {
    return ['/store', this.storeSlug(), 'products', this.product().slug];
  }

  increment(): void {
    this.qty.update((q) => q + 1);
    this.cart.addListItem(this.product(), this.qty());
  }

  decrement(): void {
    this.qty.update((q) => Math.max(1, q - 1));
  }
}
