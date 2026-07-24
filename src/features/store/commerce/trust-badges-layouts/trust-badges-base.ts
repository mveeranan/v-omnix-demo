import { Directive, computed, input } from '@angular/core';
import { Portfolio, PortfolioTrustBadges, TrustBadgeItem } from '../../../portfolio/models/portfolio.model';
import { resolveTrustBadgeIcon } from '../../../portfolio/models/trust-badges-icons';

export interface BadgeDisplay {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
}

/**
 * Shared data logic for every Trust Badges layout variant.
 *
 * Reads its config from portfolio.trustBadges (heading, item limit, layout
 * style), filters/sorts enabled badges, and applies the item limit. Concrete
 * layouts extend this and provide only template + styles.
 */
@Directive()
export abstract class TrustBadgesBase {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input<string>('');
  readonly enabled = input(true);
  readonly forceShow = input(false);

  protected get section(): PortfolioTrustBadges {
    return this.portfolio().trustBadges;
  }

  /** Heading: admin's custom display name (no heading shown when unset — matches the original design). */
  get heading(): string | undefined {
    return this.section.displayName?.trim() || undefined;
  }

  private get limit(): number | undefined {
    return this.section.itemLimit;
  }

  readonly items = computed<BadgeDisplay[]>(() => {
    if (!this.enabled()) return [];
    if (!this.section.enabled && !this.forceShow()) return [];
    if (!this.section.badges?.length) return [];

    const sorted = this.section.badges
      .filter((b: TrustBadgeItem) => b.enabled)
      .sort((a: TrustBadgeItem, b: TrustBadgeItem) => (a.order ?? 0) - (b.order ?? 0));

    const limited = this.limit ? sorted.slice(0, this.limit) : sorted;

    return limited.map((badge: TrustBadgeItem) => ({
      icon: resolveTrustBadgeIcon(badge.icon),
      title: badge.title
    }));
  });
}
