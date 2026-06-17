import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { LucideAngularModule, ChevronDown, Check, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-collapsible-section-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pf-editor-card">
      <button
        type="button"
        class="pf-editor-card__header"
        (click)="expanded.set(!expanded())"
        [attr.aria-expanded]="expanded()"
      >
        @if (icon()) {
          <lucide-icon [img]="icon()!" class="pf-editor-card__icon h-5 w-5 shrink-0" />
        }
        <span class="pf-editor-card__title">{{ title() }}</span>
        @if (complete()) {
          <lucide-icon [img]="checkIcon" class="h-4 w-4 text-emerald-500" />
        }
        <lucide-icon
          [img]="chevronIcon"
          class="h-5 w-5 shrink-0 opacity-50 transition-transform duration-200"
          [class.rotate-180]="expanded()"
        />
      </button>
      @if (expanded()) {
        <div class="pf-editor-card__body">
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: `:host { display: block; }`
})
export class CollapsibleSectionCardComponent {
  readonly title = input.required<string>();
  readonly icon = input<LucideIconData | null>(null);
  readonly complete = input(false);
  readonly expanded = model(true);

  readonly chevronIcon = ChevronDown;
  readonly checkIcon = Check;
}
