import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { DealOfWeekBase } from './deal-of-week-base';

/** Compact List — all active deals as rows with a small countdown badge, no swipe. */
@Component({
  selector: 'app-deal-of-week-compact-list',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (deals().length) {
      <section class="dow-list-section">
        <div class="container mx-auto px-6">
          @if (heading) {
            <h2 class="dow-list__heading">{{ heading }}</h2>
          }
          <ul class="dow-list">
            @for (deal of deals(); track deal.product!.id) {
              <li class="dow-row">
                <img class="dow-row__img" [src]="getPrimaryImage(deal.product)" [alt]="deal.product!.name" loading="lazy" />
                <span class="dow-row__name">{{ deal.title || deal.product!.name }}</span>
                <span class="dow-row__countdown">{{ getCountdown(deal).days }}d {{ getCountdown(deal).hours }}h {{ getCountdown(deal).minutes }}m left</span>
                <span class="dow-row__price">{{ deal.product!.price | currency:'USD' }}</span>
                <button type="button" class="dow-row__cta" (click)="addToCart(deal)">Add</button>
              </li>
            }
          </ul>
        </div>
      </section>
    }
  `,
  styles: `
    .dow-list-section { padding: 2.5rem 0; }
    .dow-list__heading { text-align: center; font-size: 1.25rem; font-weight: 700; margin: 0 0 1.25rem; color: var(--mox-text, #1a1a1a); }
    .dow-list { list-style: none; margin: 0 auto; padding: 0; max-width: 48rem; border-top: 1px solid var(--mox-border, #eaeaea); }
    .dow-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 0.5rem; border-bottom: 1px solid var(--mox-border, #eaeaea); }
    .dow-row__img { width: 3.5rem; height: 3.5rem; object-fit: contain; background: var(--mox-surface, #f5f5f5); border-radius: 6px; }
    .dow-row__name { flex: 1; font-weight: 600; font-size: 0.9rem; color: var(--mox-text, #1a1a1a); }
    .dow-row__countdown { font-size: 0.75rem; color: var(--mox-accent, #ff6f00); font-weight: 600; }
    .dow-row__price { font-weight: 700; color: var(--mox-text, #1a1a1a); }
    .dow-row__cta { padding: 0.4rem 1rem; background: var(--mox-accent, #ff6f00); color: #fff; border: none; border-radius: 999px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
  `
})
export class DealOfWeekCompactListComponent extends DealOfWeekBase {}
