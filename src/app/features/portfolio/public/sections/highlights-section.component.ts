import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../models/portfolio.model';
import { LucideAngularModule, Sparkles, Shield, Award, Clock } from 'lucide-angular';

@Component({
  selector: 'app-pf-highlights-section',
  standalone: true,
  imports: [ScrollRevealDirective, LucideAngularModule],
  template: `
    @if (portfolio().highlights.enabled && portfolio().highlights.items.length) {
      <section class="pf-section pf-section-alt" id="highlights">
        <div class="container mx-auto px-6">
          <div appScrollReveal class="text-center">
            <p class="pf-eyebrow">Why choose us</p>
            <h2 class="pf-display pf-heading mt-2 text-3xl font-semibold md:text-4xl">
              {{ portfolio().highlights.title }}
            </h2>
          </div>
          <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            @for (item of portfolio().highlights.items; track item; let i = $index) {
              <article
                appScrollReveal="scale-in"
                [appScrollRevealDelay]="i * 70"
                class="pf-glass-card pf-highlight-card p-6 text-center"
              >
                <lucide-icon [img]="icons[i % icons.length]" class="pf-highlight-icon mx-auto h-8 w-8" />
                <p class="pf-text mt-4 text-sm leading-relaxed">{{ item }}</p>
              </article>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class HighlightsSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly icons = [Sparkles, Shield, Award, Clock];
}
