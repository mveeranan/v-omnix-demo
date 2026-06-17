import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Portfolio } from '../../models/portfolio.model';
import { resolveHighlightIcon } from '../../models/highlight-icons';

@Component({
  selector: 'app-pf-highlights-section',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (portfolio().highlights.enabled && portfolio().highlights.items.length) {
      <section class="mox-section" id="services">
        <div class="container mx-auto px-6">
          <div class="mox-services">
            @for (item of portfolio().highlights.items; track item.text) {
              <div class="mox-service-item">
                <div class="mox-service-item__icon">
                  <lucide-icon [img]="iconFor(item.iconId)" class="h-5 w-5" />
                </div>
                <p class="mox-service-item__text">{{ item.text }}</p>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class HighlightsSectionComponent {
  readonly portfolio = input.required<Portfolio>();

  iconFor(iconId: string) {
    return resolveHighlightIcon(iconId);
  }
}
