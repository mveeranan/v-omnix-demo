import { Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { ICON_SIZE_FEATURE } from './icon.constants';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="app-empty-state">
      @if (icon()) {
        <lucide-icon [img]="icon()!" [class]="iconClass + ' text-[var(--text-muted)]'" />
      }
      <h3 class="app-empty-state__title">{{ title() }}</h3>
      @if (description()) {
        <p class="app-empty-state__description">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `
})
export class AppEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string | undefined>();
  readonly icon = input<LucideIconData | undefined>();
  readonly iconClass = ICON_SIZE_FEATURE;
}
