import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <button type="button" class="absolute inset-0 bg-black/40" (click)="cancelled.emit()" aria-label="Close"></button>
        <div class="admin-glass-card relative z-10 w-full max-w-md rounded-xl p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-[var(--text-primary)]">{{ title() }}</h2>
          @if (message()) {
            <p class="mt-2 text-sm text-[var(--text-secondary)]">{{ message() }}</p>
          }
          <div class="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="cancelled.emit()">
              {{ cancelLabel() }}
            </button>
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm"
              [class.admin-action-primary]="!danger()"
              [class.bg-rose-600]="danger()"
              [class.text-white]="danger()"
              (click)="confirmed.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  readonly open = input(false);
  readonly title = input('Confirm');
  readonly message = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly danger = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
