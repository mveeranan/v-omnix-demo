import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-admin-detail-field',
  standalone: true,
  template: `
    <div class="admin-detail-field" [class.admin-detail-field--span2]="span2()">
      <span class="pf-editor-label">{{ label() }}</span>
      <p class="admin-detail-field__value">{{ displayValue() }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-detail-field {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .admin-detail-field--span2 {
      grid-column: span 2;
    }

    .admin-detail-field__value {
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: rgb(15 23 42);
      white-space: pre-wrap;
      word-break: break-word;
    }

    :host-context(.dark) .admin-detail-field__value {
      color: rgb(244 244 245);
    }

    .admin-detail-empty {
      margin: 0;
      font-size: 0.875rem;
      color: rgb(100 116 139);
    }

    :host-context(.dark) .admin-detail-empty {
      color: rgb(161 161 170);
    }
  `
})
export class AdminDetailFieldComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>('');
  readonly emptyText = input('—');
  readonly span2 = input(false);

  readonly displayValue = computed(() => {
    const raw = this.value();
    if (raw === null || raw === undefined) {
      return this.emptyText();
    }
    const text = String(raw).trim();
    return text || this.emptyText();
  });
}
