import { NgClass } from '@angular/common';
import { Component, input, output, HostListener } from '@angular/core';
import { backdropFade } from '../animations/admin.animations';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-admin-modal-shell',
  standalone: true,
  imports: [NgClass, LucideAngularModule],
  animations: [backdropFade],
  template: `
    @if (open()) {
      <div
        @backdropFade
        class="admin-modal-root z-[60] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()">
        @if (closeOnBackdrop()) {
          <button
            type="button"
            class="admin-modal-backdrop absolute inset-0"
            aria-label="Close dialog"
            (click)="backdropClose.emit()"></button>
        } @else {
          <div class="admin-modal-backdrop absolute inset-0" aria-hidden="true"></div>
        }
        <article
          class="admin-glass-card admin-modal-panel relative z-10 flex max-h-full w-full max-w-full flex-col overflow-hidden"
          [ngClass]="panelClass()"
          (click)="$event.stopPropagation()">
          <header class="admin-modal-panel__header flex shrink-0 items-center justify-between gap-3 px-5 py-4">
            <div class="min-w-0">
              <h2 class="truncate text-base font-semibold text-[var(--text-primary)]">{{ title() }}</h2>
              @if (subtitle()) {
                <p class="mt-0.5 text-xs text-[var(--text-muted)]">{{ subtitle() }}</p>
              }
            </div>
            @if (showCloseButton()) {
              <button
                type="button"
                class="admin-bookings-icon-btn shrink-0"
                aria-label="Close"
                [disabled]="disableClose()"
                (click)="close.emit()">
                <lucide-icon [img]="closeIcon" class="h-4 w-4" />
              </button>
            }
          </header>
          <div class="admin-modal-panel__body min-h-0 overflow-y-auto px-5 py-4">
            <ng-content />
          </div>
          @if (showFooter()) {
            <footer class="admin-modal-panel__footer flex shrink-0 items-center justify-end gap-2 px-5 py-4">
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
  readonly panelClass = input('admin-modal-panel--standard');
  readonly showFooter = input(true);
  readonly showCloseButton = input(true);
  readonly disableClose = input(false);
  /** When false, clicking the backdrop does not close the dialog (default for create/update). */
  readonly closeOnBackdrop = input(false);
  /** When false, Escape does not close the dialog (default for create/update). */
  readonly closeOnEscape = input(false);

  readonly close = output<void>();
  readonly backdropClose = output<void>();

  readonly closeIcon = X;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open() && this.closeOnEscape() && !this.disableClose()) {
      this.close.emit();
    }
  }
}
