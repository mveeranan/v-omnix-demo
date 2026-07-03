import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, Lock, RefreshCw, Truck, Users } from 'lucide-angular';
import { Portfolio, PortfolioTrustBadges } from '../../portfolio/models/portfolio.model';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';

interface ServiceItem {
  icon: typeof Truck;
  title: string;
  text: string;
}

/** Minishop "services strip": 3 icon + text media blocks under the hero. */
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
                <p class="msp-services__text">{{ item.text }}</p>
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
    @media (min-width: 768px) {
      .msp-services__grid { grid-template-columns: repeat(3, 1fr); }
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
      margin: 0 0 0.2rem;
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--mox-text, #000);
    }
    .msp-services__text {
      margin: 0;
      font-size: 0.85rem;
      color: var(--mox-muted, #808080);
    }
  `
})
export class TrustBadgesStripComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly forceShow = input(false);

  readonly usersIcon = Users;

  private readonly badges = computed((): PortfolioTrustBadges => {
    const p = this.portfolio();
    if (!p.trustBadges.enabled && !this.forceShow()) {
      return { ...p.trustBadges, enabled: false };
    }
    return p.trustBadges;
  });

  readonly items = computed((): ServiceItem[] => {
    const b = this.badges();
    if (!b.enabled) return [];

    const items: ServiceItem[] = [];
    if (b.freeShipping) {
      items.push({ icon: Truck, title: 'Free Shipping', text: 'Free shipping on all orders' });
    }
    if (b.customerCountLabel?.trim()) {
      items.push({ icon: Users, title: 'Support Customer', text: b.customerCountLabel });
    }
    if (b.securePayment) {
      items.push({ icon: Lock, title: 'Secure Payments', text: 'Guaranteed secure checkout' });
    }
    if (b.moneyBack) {
      items.push({ icon: RefreshCw, title: 'Money-Back Guarantee', text: '30-day easy returns' });
    }
    return items.slice(0, 3);
  });
}
