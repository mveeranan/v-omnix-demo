import { Component, computed, input } from '@angular/core';

export type AppBadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span [class]="classes()"><ng-content /></span>`
})
export class AppBadgeComponent {
  readonly tone = input<AppBadgeTone>('neutral');
  readonly legacyClass = input<string | undefined>();

  readonly classes = computed(() => {
    const parts = ['app-badge', `app-badge--${this.tone()}`];
    const legacy = this.legacyClass();
    if (legacy) parts.push(legacy);
    return parts.join(' ');
  });
}
