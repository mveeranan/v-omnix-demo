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
              <div class="msp-services__icon-wrap">
                <lucide-icon [img]="item.icon" class="msp-services__icon" />
              </div>
              <h3 class="msp-services__title">{{ item.title }}</h3>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    /* Trust badges: clean line-icon style, elegant spacing */
    .msp-services {
      padding: 3.5rem 0;
      background: var(--mox-bg, #fff);
    }
    .msp-services__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem 1rem;
    }
    @media (min-width: 640px) {
      .msp-services__grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2.5rem 1.5rem;
      }
    }
    @media (min-width: 992px) {
      .msp-services__grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 3rem 2rem;
      }
    }
    .msp-services__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
      padding: 1.5rem 1rem 0;
    }
    .msp-services__icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      height: 3.5rem;
      width: 3.5rem;
    }
    .msp-services__icon {
      width: 2rem;
      height: 2rem;
      color: var(--mox-text, #1a1a1a);
      stroke-width: 1.2;
    }
    .msp-services__title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.2px;
      color: var(--mox-text, #1a1a1a);
      line-height: 1.4;
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
