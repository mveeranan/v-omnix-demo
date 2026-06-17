import { Component, input, output } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

export type StoreButtonVariant = 'primary' | 'secondary';

@Component({
  selector: 'app-store-animated-button',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (href()) {
      <a
        [href]="href()!"
        [attr.target]="external() ? '_blank' : null"
        [attr.rel]="external() ? 'noopener noreferrer' : null"
        [class]="classes()"
      >
        @if (icon()) {
          <lucide-icon [img]="icon()!" class="h-5 w-5 shrink-0" />
        }
        <ng-content />
      </a>
    } @else {
      <button [type]="type()" [class]="classes()" [disabled]="disabled()" (click)="clicked.emit()">
        @if (icon()) {
          <lucide-icon [img]="icon()!" class="h-5 w-5 shrink-0" />
        }
        <ng-content />
      </button>
    }
  `,
  styles: `:host { display: inline-flex; }`
})
export class AnimatedButtonComponent {
  readonly variant = input<StoreButtonVariant>('primary');
  readonly pulse = input(false);
  readonly icon = input<LucideIconData | null>(null);
  readonly href = input<string | null>(null);
  readonly external = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');

  readonly clicked = output<void>();

  classes(): string {
    const parts = ['store-animated-btn', `store-animated-btn--${this.variant()}`];
    if (this.pulse()) parts.push('store-animated-btn--pulse');
    return parts.join(' ');
  }
}
