import { CurrencyPipe } from '@angular/common';
import { Component, computed } from '@angular/core';
import { DealOfWeekBase } from './deal-of-week-base';

/** Minimal Countdown Bar — a thin full-width strip: name, countdown, price, CTA. No image. */
@Component({
  selector: 'app-deal-of-week-minimal-bar',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (deal(); as d) {
      <section class="dow-bar">
        <div class="container mx-auto px-6 dow-bar__row">
          <span class="dow-bar__label">{{ heading || 'Deal Of The Week' }}:</span>
          <span class="dow-bar__name">{{ d.title || d.product!.name }}</span>
          <span class="dow-bar__countdown">{{ countdown().days }}d {{ countdown().hours }}h {{ countdown().minutes }}m {{ countdown().seconds }}s</span>
          <span class="dow-bar__price">{{ d.product!.price | currency:'USD' }}</span>
          <button type="button" class="dow-bar__cta" (click)="addToCart(d)">Add to cart</button>
        </div>
      </section>
    }
  `,
  styles: `
    .dow-bar { padding: 0.85rem 0; background: var(--mox-accent, #ff6f00); }
    .dow-bar__row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .dow-bar__label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #000; }
    .dow-bar__name { font-weight: 700; color: #000; flex: 1; }
    .dow-bar__countdown { font-size: 0.8rem; font-weight: 700; color: #fff; }
    .dow-bar__price { font-weight: 800; color: #fff; }
    .dow-bar__cta { padding: 0.4rem 1.1rem; background: #000; color: #fff; border: none; border-radius: 999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
  `
})
export class DealOfWeekMinimalBarComponent extends DealOfWeekBase {
  readonly deal = computed(() => this.deals()[0]);
  readonly countdown = computed(() => this.getCountdown(this.deal()));
}
