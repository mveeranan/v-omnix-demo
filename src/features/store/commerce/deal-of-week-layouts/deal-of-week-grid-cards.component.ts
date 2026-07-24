import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { DealOfWeekBase } from './deal-of-week-base';

/** Grid Cards — all active deals as an even card grid, each with its own countdown. */
@Component({
  selector: 'app-deal-of-week-grid-cards',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (deals().length) {
      <section class="dow-grid-section">
        <div class="container mx-auto px-6">
          @if (heading) {
            <h2 class="dow-grid__heading">{{ heading }}</h2>
          }
          <div class="dow-grid">
            @for (deal of deals(); track deal.product!.id) {
              <div class="dow-grid-card">
                <img class="dow-grid-card__img" [src]="getPrimaryImage(deal.product)" [alt]="deal.product!.name" loading="lazy" />
                <p class="dow-grid-card__name">{{ deal.title || deal.product!.name }}</p>
                <p class="dow-grid-card__countdown">{{ getCountdown(deal).days }}d {{ getCountdown(deal).hours }}h {{ getCountdown(deal).minutes }}m</p>
                <p class="dow-grid-card__price">{{ deal.product!.price | currency:'USD' }}</p>
                <button type="button" class="dow-grid-card__cta" (click)="addToCart(deal)">Add to cart</button>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .dow-grid-section { padding: 3rem 0; }
    .dow-grid__heading { text-align: center; font-size: 1.25rem; font-weight: 700; margin: 0 0 1.5rem; color: var(--mox-text, #1a1a1a); }
    .dow-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
    @media (min-width: 768px) { .dow-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 1100px) { .dow-grid { grid-template-columns: repeat(4, 1fr); } }
    .dow-grid-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 1.25rem; border: 1px solid var(--mox-border, #eaeaea); border-radius: var(--mox-radius, 8px); }
    .dow-grid-card__img { width: 6rem; height: 6rem; object-fit: contain; margin-bottom: 0.75rem; }
    .dow-grid-card__name { font-size: 0.85rem; font-weight: 600; color: var(--mox-text, #1a1a1a); margin: 0 0 0.35rem; }
    .dow-grid-card__countdown { font-size: 0.72rem; color: var(--mox-accent, #ff6f00); font-weight: 700; margin: 0 0 0.5rem; }
    .dow-grid-card__price { font-size: 1rem; font-weight: 700; color: var(--mox-text, #1a1a1a); margin: 0 0 0.75rem; }
    .dow-grid-card__cta { padding: 0.5rem 1.25rem; background: var(--mox-accent, #ff6f00); color: #fff; border: none; border-radius: 999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
  `
})
export class DealOfWeekGridCardsComponent extends DealOfWeekBase {}
