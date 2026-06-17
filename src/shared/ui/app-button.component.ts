import { Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { ICON_SIZE_INLINE } from './icon.constants';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AppButtonSize = 'sm' | 'md' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <button [type]="type()" [disabled]="disabled()" [class]="buttonClasses()" [attr.aria-label]="ariaLabel() || null">
      @if (icon()) {
        <lucide-icon [img]="icon()!" [class]="iconClass" />
      }
      <ng-content />
    </button>
  `,
  host: { class: 'inline-flex' }
})
export class AppButtonComponent {
  readonly variant = input<AppButtonVariant>('primary');
  readonly size = input<AppButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly icon = input<LucideIconData | undefined>();
  readonly ariaLabel = input<string | undefined>();
  readonly legacyClass = input<string | undefined>();

  readonly iconClass = ICON_SIZE_INLINE;

  buttonClasses(): string {
    const parts = ['app-btn', `app-btn--${this.variant()}`];
    if (this.size() === 'icon') parts.push('app-btn--icon');
    const legacy = this.legacyClass();
    if (legacy) parts.push(legacy);
    return parts.join(' ');
  }
}
