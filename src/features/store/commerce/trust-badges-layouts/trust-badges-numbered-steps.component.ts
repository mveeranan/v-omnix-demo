import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TrustBadgesBase } from './trust-badges-base';

/** Numbered Steps — each badge shown as a numbered step (01, 02, 03...) instead of an icon-first layout. */
@Component({
  selector: 'app-trust-badges-numbered-steps',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (items().length) {
      <section class="tb-steps-section">
        <div class="container mx-auto px-6">
          @if (heading) {
            <h2 class="tb-steps__heading">{{ heading }}</h2>
          }
          <div class="tb-steps">
            @for (item of items(); track item.title; let i = $index) {
              <div class="tb-step">
                <span class="tb-step__number">{{ (i + 1).toString().padStart(2, '0') }}</span>
                <lucide-icon [img]="item.icon" class="tb-step__icon" />
                <span class="tb-step__title">{{ item.title }}</span>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .tb-steps-section { padding: 3rem 0; background: var(--mox-bg, #fff); }
    .tb-steps__heading {
      margin: 0 0 1.75rem; text-align: center;
      font-size: 1.25rem; font-weight: 700; color: var(--mox-text, #1a1a1a);
    }
    .tb-steps {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 640px) { .tb-steps { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 992px) { .tb-steps { grid-template-columns: repeat(3, 1fr); } }

    .tb-step {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding-left: 0.25rem;
    }
    .tb-step__number {
      font-size: 2.25rem;
      font-weight: 800;
      color: color-mix(in srgb, var(--mox-accent, #ff6f00) 30%, transparent);
      line-height: 1;
    }
    .tb-step__icon { width: 1.4rem; height: 1.4rem; color: var(--mox-accent, #ff6f00); stroke-width: 1.4; margin-top: -1.5rem; }
    .tb-step__title { font-size: 0.9rem; font-weight: 600; color: var(--mox-text, #1a1a1a); }
  `
})
export class TrustBadgesNumberedStepsComponent extends TrustBadgesBase {}
