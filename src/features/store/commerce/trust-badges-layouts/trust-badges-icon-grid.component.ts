import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TrustBadgesBase } from './trust-badges-base';

/** Small Icon Grid — compact 4-6 across tiles, denser than the default 3-col row. */
@Component({
  selector: 'app-trust-badges-icon-grid',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (items().length) {
      <section class="tb-icon-grid-section">
        <div class="container mx-auto px-6">
          @if (heading) {
            <h2 class="tb-icon-grid__heading">{{ heading }}</h2>
          }
          <div class="tb-icon-grid">
            @for (item of items(); track item.title) {
              <div class="tb-icon-grid__item">
                <lucide-icon [img]="item.icon" class="tb-icon-grid__icon" />
                <span class="tb-icon-grid__title">{{ item.title }}</span>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .tb-icon-grid-section { padding: 2.5rem 0; background: var(--mox-bg, #fff); }
    .tb-icon-grid__heading {
      margin: 0 0 1.5rem; text-align: center;
      font-size: 1.25rem; font-weight: 700; color: var(--mox-text, #1a1a1a);
    }
    .tb-icon-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    @media (min-width: 640px) { .tb-icon-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 992px) { .tb-icon-grid { grid-template-columns: repeat(6, 1fr); } }

    .tb-icon-grid__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 0.5rem;
    }
    .tb-icon-grid__icon { width: 1.5rem; height: 1.5rem; color: var(--mox-accent, #ff6f00); stroke-width: 1.4; }
    .tb-icon-grid__title { font-size: 0.78rem; font-weight: 600; text-align: center; color: var(--mox-text, #1a1a1a); }
  `
})
export class TrustBadgesIconGridComponent extends TrustBadgesBase {}
