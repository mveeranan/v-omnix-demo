import { Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Portfolio, PortfolioTrustBadges, TrustBadgeItem } from '../../portfolio/models/portfolio.model';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { resolveTrustBadgeIcon } from '../../portfolio/models/trust-badges-icons';

interface BadgeDisplay {
  icon: any;
  title: string;
}

/** Minishop "services strip": responsive grid of trust badges. */
@Component({
  selector: 'app-trust-badges-strip',
  standalone: true,
  imports: [LucideAngularModule, ScrollRevealDirective],
  template: `
    @if (items().length) {
      <section class="msp-services">
        <div class="container mx-auto px-6 msp-services__grid">
          @for (item of items(); track item.title; let i = $index) {
            <div class="msp-services__item" appScrollReveal="fade-up" [appScrollRevealDelay]="i * 100">
              <lucide-icon [img]="item.icon" class="msp-services__icon" />
              <div>
                <p class="msp-services__title">{{ item.title }}</p>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .msp-services { padding: 3.5rem 0; background: var(--mox-bg, #fff); }
    .msp-services__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media (min-width: 640px) {
      .msp-services__grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 768px) {
      .msp-services__grid { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
    }
    .msp-services__item {
      display: flex;
      align-items: center;
      gap: 1.1rem;
    }
    .msp-services__icon {
      width: 2.5rem;
      height: 2.5rem;
      flex-shrink: 0;
      color: var(--mox-accent, #dbcc8f);
    }
    .msp-services__title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--mox-text, #000);
    }
  `
})
export class TrustBadgesStripComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly forceShow = input(false);

  private readonly badges = computed((): PortfolioTrustBadges => {
    const p = this.portfolio();
    if (!p.trustBadges.enabled && !this.forceShow()) {
      return { ...p.trustBadges, enabled: false };
    }
    return p.trustBadges;
  });

  readonly items = computed((): BadgeDisplay[] => {
    const b = this.badges();
    if (!b.enabled || !b.badges?.length) return [];

    // Filter enabled badges, sort by order, and map to display format
    return b.badges
      .filter((badge: TrustBadgeItem) => badge.enabled)
      .sort((a: TrustBadgeItem, b: TrustBadgeItem) => (a.order ?? 0) - (b.order ?? 0))
      .map((badge: TrustBadgeItem) => ({
        icon: resolveTrustBadgeIcon(badge.icon),
        title: badge.title
      }));
  });
}
