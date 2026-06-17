import { Component, input, signal } from '@angular/core';
import { AdminImagePreviewModalComponent } from './admin-image-preview-modal.component';

@Component({
  selector: 'app-admin-detail-media',
  standalone: true,
  imports: [AdminImagePreviewModalComponent],
  host: {
    class: 'admin-detail-media-host'
  },
  template: `
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

    @if (previewOpen()) {
      <app-admin-image-preview-modal [title]="label()" [url]="url()" (close)="closePreview()" />
    }
  `
})
export class AdminDetailMediaComponent {
  readonly label = input.required<string>();
  readonly url = input('');
  readonly emptyText = input('—');

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
