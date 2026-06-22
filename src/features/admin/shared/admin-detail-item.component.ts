import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-admin-detail-item',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="admin-detail-item" [class.admin-detail-item--with-divider]="divider()">
      @if (icon()) {
        <div class="admin-detail-item__icon">
          <lucide-icon [img]="icon()!" class="h-4 w-4" />
        </div>
      }
      <div class="admin-detail-item__content">
        <span class="admin-detail-item__label">{{ label() }}</span>
        <p class="admin-detail-item__value" [class.admin-detail-item__value--multiline]="multiline()">
          {{ displayValue() }}
        </p>
      </div>
    </div>
  `
})
export class AdminDetailItemComponent {
  readonly icon = input<LucideIconData | null>(null);
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>('');
  readonly emptyText = input('—');
  readonly divider = input(false);
  readonly multiline = input(false);

  readonly displayValue = computed(() => {
    const raw = this.value();
    if (raw === null || raw === undefined) {
      return this.emptyText();
    }
    const text = String(raw).trim();
    return text || this.emptyText();
  });
}
