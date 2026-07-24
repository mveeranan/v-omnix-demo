import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TrustBadgesBase } from './trust-badges-base';

/** Minimal Text List — a single inline row of icon+text, no boxes, no wrap grid. */
@Component({
  selector: 'app-trust-badges-text-list',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (items().length) {
      <section class="tb-list-section">
        <div class="container mx-auto px-6">
          @if (heading) {
            <h2 class="tb-list__heading">{{ heading }}</h2>
          }
          <ul class="tb-list">
            @for (item of items(); track item.title; let last = $last) {
              <li class="tb-list__item">
                <lucide-icon [img]="item.icon" class="tb-list__icon" />
                <span>{{ item.title }}</span>
                @if (!last) {
                  <span class="tb-list__divider" aria-hidden="true"></span>
                }
              </li>
            }
          </ul>
        </div>
      </section>
    }
  `,
  styles: `
    .tb-list-section { padding: 1.75rem 0; border-top: 1px solid var(--mox-border, #eaeaea); border-bottom: 1px solid var(--mox-border, #eaeaea); }
    .tb-list__heading {
      margin: 0 0 1rem; text-align: center;
      font-size: 1.1rem; font-weight: 700; color: var(--mox-text, #1a1a1a);
    }
    .tb-list {
      list-style: none;
      margin: 0; padding: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem 0;
    }
    .tb-list__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--mox-text, #1a1a1a);
    }
    .tb-list__icon { width: 1.1rem; height: 1.1rem; color: var(--mox-accent, #ff6f00); stroke-width: 1.5; }
    .tb-list__divider { width: 1px; height: 1rem; background: var(--mox-border, #eaeaea); margin-left: 1.25rem; }
  `
})
export class TrustBadgesTextListComponent extends TrustBadgesBase {}
