import { Component, input, output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-admin-image-preview-modal',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="admin-image-preview-modal" role="dialog" aria-modal="true" [attr.aria-label]="title() + ' preview'">
      <button
        type="button"
        class="admin-image-preview-modal__backdrop"
        (click)="close.emit()"
        aria-label="Close preview"
      ></button>
      <div class="admin-image-preview-modal__panel">
        <header class="admin-image-preview-modal__header">
          <h2 class="admin-image-preview-modal__title">{{ title() }}</h2>
          <button type="button" class="admin-image-preview-modal__close" (click)="close.emit()" aria-label="Close">
            <lucide-icon [img]="closeIcon" class="h-5 w-5" />
          </button>
        </header>
        <div class="admin-image-preview-modal__body">
          <img [src]="url()" [alt]="title()" class="admin-image-preview-modal__img" />
        </div>
      </div>
    </div>
  `
})
export class AdminImagePreviewModalComponent {
  readonly title = input.required<string>();
  readonly url = input.required<string>();
  readonly close = output<void>();
  readonly closeIcon = X;
}
