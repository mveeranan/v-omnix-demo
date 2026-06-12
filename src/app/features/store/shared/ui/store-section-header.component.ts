import { Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-store-section-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="store-section-header">
      @if (icon()) {
        <div class="store-section-header__icon-wrap">
          <lucide-icon [img]="icon()!" class="h-5 w-5" />
        </div>
      }
      @if (eyebrow()) {
        <p class="pf-eyebrow">{{ eyebrow() }}</p>
      }
      <h2 class="pf-display pf-heading mt-2 text-3xl font-semibold md:text-4xl">{{ title() }}</h2>
      @if (subtitle()) {
        <p class="pf-text-muted mt-3 text-base">{{ subtitle() }}</p>
      }
    </header>
  `
})
export class StoreSectionHeaderComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input<LucideIconData | null>(null);
}
