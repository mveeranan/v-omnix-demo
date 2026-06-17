import { Component } from '@angular/core';
import { LucideAngularModule, BadgeCheck } from 'lucide-angular';

@Component({
  selector: 'app-verified-badge',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <span class="verified-badge">
      <lucide-icon [img]="icon" class="h-3 w-3" />
      Verified purchase
    </span>
  `
})
export class VerifiedBadgeComponent {
  readonly icon = BadgeCheck;
}
