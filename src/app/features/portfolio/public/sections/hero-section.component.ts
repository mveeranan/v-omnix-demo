import { Component, computed, input, output } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShoppingBag } from 'lucide-angular';
import { Portfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-pf-hero-section',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './hero-section.component.html',
  animations: [
    trigger('heroEnter', [
      transition(':enter', [
        query('.hero-item', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger(120, [
            animate('600ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class HeroSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly viewWork = output<void>();
  readonly shopIcon = ShoppingBag;

  readonly eyebrow = computed(() => {
    const p = this.portfolio();
    return p.hero.eyebrow?.trim() || 'special offer';
  });

  readonly headline = computed(() => {
    const p = this.portfolio();
    return p.hero.headline?.trim() || p.brand.businessName || 'top collection';
  });

  readonly subheadline = computed(() => {
    const p = this.portfolio();
    return p.hero.subheadline?.trim() || p.brand.tagline;
  });

  shopLink(): string[] {
    const slug = this.portfolio().slug;
    return slug ? ['/store', slug, 'products'] : ['/store'];
  }

  contactLink(): string[] {
    const slug = this.portfolio().slug;
    return slug ? ['/store', slug, 'contact'] : ['/store'];
  }
}
