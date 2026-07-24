import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TrustBadgesBase } from './trust-badges-base';

/** Bordered Cards — each badge as its own boxed card with a border. */
@Component({
  selector: 'app-trust-badges-bordered-cards',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (items().length) {
      <section class="tb-cards-section">
        <div class="container mx-auto px-6">
          @if (heading) {
            <h2 class="tb-cards__heading">{{ heading }}</h2>
          }
          <div class="tb-cards">
            @for (item of items(); track item.title) {
              <div class="tb-card">
                <lucide-icon [img]="item.icon" class="tb-card__icon" />
                <span class="tb-card__title">{{ item.title }}</span>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .tb-cards-section { padding: 3rem 0; background: var(--mox-bg, #fff); }
    .tb-cards__heading {
      margin: 0 0 1.5rem; text-align: center;
      font-size: 1.25rem; font-weight: 700; color: var(--mox-text, #1a1a1a);
    }
    .tb-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    @media (min-width: 640px) { .tb-cards { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 992px) { .tb-cards { grid-template-columns: repeat(3, 1fr); } }

    .tb-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-radius, 8px);
      background: var(--mox-surface, #fff);
    }
    .tb-card__icon { flex: 0 0 auto; width: 1.75rem; height: 1.75rem; color: var(--mox-accent, #ff6f00); stroke-width: 1.3; }
    .tb-card__title { font-size: 0.9rem; font-weight: 600; color: var(--mox-text, #1a1a1a); }
  `
})
export class TrustBadgesBorderedCardsComponent extends TrustBadgesBase {}
