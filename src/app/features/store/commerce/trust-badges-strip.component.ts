import { Component, computed, input } from '@angular/core';
import { Lock, RefreshCw, Truck, Users } from 'lucide-angular';
import { Portfolio, PortfolioTrustBadges } from '../../portfolio/models/portfolio.model';
import { TrustBadgeComponent } from '../shared/ui/trust-badge.component';

@Component({
  selector: 'app-trust-badges-strip',
  standalone: true,
  imports: [TrustBadgeComponent],
  template: `
    @if (badges().enabled) {
      <div class="trust-badges-strip py-4">
        @if (badges().customerCountLabel.trim()) {
          <app-trust-badge [label]="badges().customerCountLabel" [icon]="usersIcon" />
        }
        @if (badges().freeShipping) {
          <app-trust-badge label="Free shipping" [icon]="truckIcon" />
        }
        @if (badges().securePayment) {
          <app-trust-badge label="Secure payment" [icon]="lockIcon" />
        }
        @if (badges().moneyBack) {
          <app-trust-badge label="Money-back guarantee" [icon]="refreshIcon" />
        }
        @if (badges().fastDelivery) {
          <app-trust-badge label="Fast delivery" [icon]="truckIcon" />
        }
      </div>
    }
  `
})
export class TrustBadgesStripComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly forceShow = input(false);

  readonly truckIcon = Truck;
  readonly lockIcon = Lock;
  readonly refreshIcon = RefreshCw;
  readonly usersIcon = Users;

  readonly badges = computed((): PortfolioTrustBadges => {
    const p = this.portfolio();
    if (!p.trustBadges.enabled && !this.forceShow()) {
      return { ...p.trustBadges, enabled: false };
    }
    return p.trustBadges;
  });
}
