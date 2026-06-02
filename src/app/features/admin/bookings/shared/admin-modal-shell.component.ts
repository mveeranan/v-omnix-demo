import { Component, input, output, HostListener } from '@angular/core';
import { backdropFade } from '../../animations/admin.animations';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-admin-modal-shell',
  standalone: true,
  imports: [LucideAngularModule],
  animations: [backdropFade],
  template: `
    @if (open()) {
      <div
        @backdropFade
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()">
        <button
          type="button"
          class="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm dark:bg-black/60"
          aria-label="Close dialog"
          (click)="backdropClose.emit()"></button>
        <article
          class="admin-glass-card relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl"
          [class]="panelClass()">
          <header class="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-100/90 px-5 py-4 dark:border-zinc-800">
            <div class="min-w-0">
              <h2 class="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">{{ title() }}</h2>
              @if (subtitle()) {
                <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{{ subtitle() }}</p>
              }
            </div>
            <button
              type="button"
              class="admin-bookings-icon-btn shrink-0"
              aria-label="Close"
              (click)="close.emit()">
              <lucide-icon [img]="closeIcon" class="h-4 w-4" />
            </button>
          </header>
          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <ng-content />
          </div>
          @if (showFooter()) {
            <footer
              class="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-100/90 px-5 py-4 dark:border-zinc-800">
              <ng-content select="[modalFooter]" />
            </footer>
          }
        </article>
      </div>
    }
  `
})
export class AdminModalShellComponent {
  readonly open = input(false);
  readonly title = input('Dialog');
  readonly subtitle = input('');
  readonly panelClass = input('');
  readonly showFooter = input(true);
  readonly closeOnEscape = input(true);

  readonly close = output<void>();
  readonly backdropClose = output<void>();

  readonly closeIcon = X;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && this.closeOnEscape()) {
      this.close.emit();
    }
  }
}
