import { Component, input, signal } from '@angular/core';
import { AdminImagePreviewModalComponent } from './admin-image-preview-modal.component';

@Component({
  selector: 'app-admin-detail-media',
  standalone: true,
  imports: [AdminImagePreviewModalComponent],
  host: {
    class: 'admin-detail-media-host',
    '[class.admin-detail-media-host--card]': 'variant() === "card"',
    '[class.admin-detail-media-host--logo]': 'fit() === "contain"',
    '[class.admin-detail-media-host--cover]': 'fit() === "cover"'
  },
  template: `
    @if (variant() === 'card') {
      <div class="admin-detail-card admin-detail-card--media">
        <span class="admin-detail-card__label">{{ label() }}</span>
        <div class="admin-detail-card__body">
          @if (url()) {
            <button
              type="button"
              class="admin-detail-media__frame"
              (click)="openPreview()"
              [attr.aria-label]="'Preview ' + label()"
            >
              <img [src]="url()" [alt]="label()" />
            </button>
          } @else {
            <div class="admin-detail-media__empty">
              <p class="admin-detail-empty">No image uploaded</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="space-y-2">
        <span class="pf-editor-label">{{ label() }}</span>
        @if (url()) {
          <button
            type="button"
            class="admin-detail-media__preview pf-editor-upload-preview"
            (click)="openPreview()"
            [attr.aria-label]="'Preview ' + label()"
          >
            <img [src]="url()" [alt]="label()" />
          </button>
        } @else {
          <p class="admin-detail-empty">No image uploaded</p>
        }
      </div>
    }

    @if (previewOpen()) {
      <app-admin-image-preview-modal [title]="label()" [url]="url()" (close)="closePreview()" />
    }
  `
})
export class AdminDetailMediaComponent {
  readonly label = input.required<string>();
  readonly url = input('');
  readonly emptyText = input('—');
  readonly variant = input<'default' | 'card'>('default');
  readonly fit = input<'cover' | 'contain'>('cover');

  readonly previewOpen = signal(false);

  openPreview(): void {
    if (!this.url()) {
      return;
    }
    this.previewOpen.set(true);
  }

  closePreview(): void {
    this.previewOpen.set(false);
  }
}
