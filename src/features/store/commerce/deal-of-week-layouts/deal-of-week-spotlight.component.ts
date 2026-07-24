import { CurrencyPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { DealOfWeekBase } from './deal-of-week-base';

/** Single Deal Spotlight — no carousel, always shows the first active deal. */
@Component({
  selector: 'app-deal-of-week-spotlight',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (deal(); as d) {
      <section class="dow-spotlight">
        <div class="container mx-auto px-6 dow-spotlight__grid">
          <img class="dow-spotlight__img" [src]="getPrimaryImage(d.product)" [alt]="d.product!.name" loading="lazy" />
          <div class="dow-spotlight__content">
            <p class="dow-spotlight__eyebrow">{{ heading || 'Deal Of The Week' }}</p>
            <h2 class="dow-spotlight__title">{{ d.title || d.product!.name }}</h2>
            <div class="dow-spotlight__countdown">
              <span class="dow-spotlight__unit">{{ countdown().days }}<small>days</small></span>
              <span class="dow-spotlight__unit">{{ countdown().hours }}<small>hrs</small></span>
              <span class="dow-spotlight__unit">{{ countdown().minutes }}<small>min</small></span>
              <span class="dow-spotlight__unit">{{ countdown().seconds }}<small>sec</small></span>
            </div>
            <div class="dow-spotlight__price">
              @if (getDiscount(d.product); as disc) {
                <span class="dow-spotlight__compare">{{ d.product!.compareAtPrice | currency:'USD' }}</span>
                <span class="dow-spotlight__badge">{{ disc }}% off</span>
              }
              <span class="dow-spotlight__now">{{ d.product!.price | currency:'USD' }}</span>
            </div>
            <button type="button" class="dow-spotlight__cta" (click)="addToCart(d)">Add to cart</button>
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .dow-spotlight { padding: 4rem 0; background: var(--mox-accent, #ff6f00); }
    .dow-spotlight__grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: center; }
    @media (min-width: 900px) { .dow-spotlight__grid { grid-template-columns: 1fr 1fr; } }
    .dow-spotlight__img { max-width: 100%; max-height: 20rem; object-fit: contain; margin: 0 auto; display: block; }
    .dow-spotlight__eyebrow { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #000; margin: 0 0 0.5rem; }
    .dow-spotlight__title { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; color: #000; margin: 0 0 1rem; }
    .dow-spotlight__countdown { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .dow-spotlight__unit { display: flex; flex-direction: column; align-items: center; font-size: 1.5rem; font-weight: 700; color: #fff; }
    .dow-spotlight__unit small { font-size: 0.6rem; text-transform: uppercase; color: rgba(0,0,0,0.6); }
    .dow-spotlight__price { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
    .dow-spotlight__compare { text-decoration: line-through; color: #000; }
    .dow-spotlight__badge { background: #000; color: var(--mox-accent, #ff6f00); padding: 0.15rem 0.5rem; font-size: 0.7rem; font-weight: 700; }
    .dow-spotlight__now { font-size: 1.3rem; font-weight: 800; color: #fff; }
    .dow-spotlight__cta { padding: 0.75rem 2rem; background: #000; color: #fff; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; }
  `
})
export class DealOfWeekSpotlightComponent extends DealOfWeekBase {
  readonly deal = computed(() => this.deals()[0]);
  readonly countdown = computed(() => this.getCountdown(this.deal()));
}
