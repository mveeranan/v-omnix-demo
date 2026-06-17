import { Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-trust-badge',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <span class="trust-badge">
      @if (icon()) {
        <lucide-icon [img]="icon()!" class="h-4 w-4 shrink-0" />
      }
      <span>{{ label() }}</span>
    </span>
  `
})
export class TrustBadgeComponent {
  readonly label = input.required<string>();
  readonly icon = input<LucideIconData | null>(null);
}
