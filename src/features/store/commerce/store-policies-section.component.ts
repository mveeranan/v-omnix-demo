import { Component, input } from '@angular/core';
import { RefreshCw, Truck, Package } from 'lucide-angular';
import { ScrollRevealDirective } from '../../portfolio/shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { StoreCardComponent } from '@features/store/shared/ui/store-card.component';
import { StoreSectionHeaderComponent } from '@features/store/shared/ui/store-section-header.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-store-policies-section',
  standalone: true,
  imports: [LucideAngularModule, ScrollRevealDirective, StoreCardComponent, StoreSectionHeaderComponent],
  template: `
    @if (portfolio().storePolicies.enabled) {
      <section class="pf-section" id="policies">
        <div class="container mx-auto px-6">
          <div appScrollReveal>
            <app-store-section-header eyebrow="Policies" title="Shop with confidence" [icon]="packageIcon" />
          </div>
          <div class="mt-10 grid gap-6 md:grid-cols-3">
            @if (portfolio().storePolicies.returnPolicy) {
              <div appScrollReveal="slide-left">
                <app-store-card class="block p-6">
                  <lucide-icon [img]="refreshIcon" class="mb-3 h-8 w-8 text-[var(--pf-accent)]" />
                  <h3 class="pf-heading font-semibold">Returns</h3>
                  <p class="pf-text-muted mt-2 text-sm leading-relaxed">{{ portfolio().storePolicies.returnPolicy }}</p>
                </app-store-card>
              </div>
            }
            @if (portfolio().storePolicies.shippingInfo) {
              <div appScrollReveal="fade-up" [appScrollRevealDelay]="80">
                <app-store-card class="block p-6">
                  <lucide-icon [img]="truckIcon" class="mb-3 h-8 w-8 text-[var(--pf-accent)]" />
                  <h3 class="pf-heading font-semibold">Shipping</h3>
                  <p class="pf-text-muted mt-2 text-sm leading-relaxed">{{ portfolio().storePolicies.shippingInfo }}</p>
                </app-store-card>
              </div>
            }
            @if (portfolio().storePolicies.deliveryTime) {
              <div appScrollReveal="slide-right" [appScrollRevealDelay]="160">
                <app-store-card class="block p-6">
                  <lucide-icon [img]="packageIcon" class="mb-3 h-8 w-8 text-[var(--pf-accent)]" />
                  <h3 class="pf-heading font-semibold">Delivery</h3>
                  <p class="pf-text-muted mt-2 text-sm leading-relaxed">{{ portfolio().storePolicies.deliveryTime }}</p>
                </app-store-card>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class StorePoliciesSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly refreshIcon = RefreshCw;
  readonly truckIcon = Truck;
  readonly packageIcon = Package;
}
