import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Image, Trash2, Star } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { PortfolioGalleryItem } from '../../models/portfolio.model';
import { captureVideoThumbnail, isGalleryImageThumbnail } from '@features/portfolio/shared/utils/video-thumbnail.util';

@Component({
  selector: 'app-gallery-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CollapsibleSectionCardComponent, MediaUploadZoneComponent],
  template: `
    <app-collapsible-section-card title="Gallery" [icon]="icon" [complete]="(draft()?.gallery?.length ?? 0) > 0">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <app-media-upload-zone
            label="Add image or video"
            accept="image/*,video/*"
            [singleSlot]="false"
            [clearAfterSelect]="true"
            (fileSelected)="onUpload($event)"
          />
          @for (item of d.gallery; track item.id) {
            <div
              class="pf-editor-item-card pf-editor-gallery-item"
              draggable="true"
              (dragstart)="dragId = item.id"
              (dragover)="onDragOver($event)"
              (drop)="onDrop($event, item.id)"
            >
              @if (item.type === 'video' && !hasImageThumbnail(item)) {
                <video
                  [src]="item.url"
                  muted
                  playsinline
                  preload="metadata"
                  class="pf-editor-gallery-item__thumb"
                ></video>
              } @else {
                <img
                  [src]="item.thumbnailUrl || item.url"
                  class="pf-editor-gallery-item__thumb"
                  alt=""
                />
              }
              <div class="pf-editor-gallery-item__fields pf-editor-fields">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Category</span>
                  <input class="pf-editor-input" [(ngModel)]="item.category" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Media type</span>
                  <select class="pf-editor-input" [(ngModel)]="item.type" (ngModelChange)="sync()">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
              <div class="pf-editor-gallery-item__actions">
                <button
                  type="button"
                  (click)="toggleFeatured(item.id)"
                  [class.text-amber-500]="item.featured"
                  aria-label="Toggle featured"
                >
                  <lucide-icon [img]="starIcon" class="h-4 w-4" />
                </button>
                <button type="button" class="text-red-500" (click)="remove(item.id)" aria-label="Remove item">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
            </div>
          }
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class GalleryEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Image;
  readonly trashIcon = Trash2;
  readonly starIcon = Star;
  dragId: string | null = null;

  async onUpload(event: { file: File; dataUrl: string }): Promise<void> {
    const isVideo = event.file.type.startsWith('video/');
    let thumbnailUrl = event.dataUrl;

    if (isVideo) {
      try {
        thumbnailUrl = await captureVideoThumbnail(event.file);
      } catch {
        thumbnailUrl = '';
      }
    }

    const item: PortfolioGalleryItem = {
      id: crypto.randomUUID(),
      type: isVideo ? 'video' : 'image',
      url: event.dataUrl,
      thumbnailUrl,
      category: 'Work',
      featured: false,
      sortOrder: this.draft()?.gallery.length ?? 0
    };
    this.state.patchDraft((p) => ({ ...p, gallery: [...p.gallery, item] }));
  }

  hasImageThumbnail(item: PortfolioGalleryItem): boolean {
    return isGalleryImageThumbnail(item.thumbnailUrl, item.url);
  }

  remove(id: string): void {
    this.state.patchDraft((p) => ({ ...p, gallery: p.gallery.filter((g) => g.id !== id) }));
  }

  toggleFeatured(id: string): void {
    this.state.patchDraft((p) => ({
      ...p,
      gallery: p.gallery.map((g) => (g.id === id ? { ...g, featured: !g.featured } : g))
    }));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetId: string): void {
    event.preventDefault();
    if (!this.dragId || this.dragId === targetId) return;
    this.state.patchDraft((p) => {
      const gallery = [...p.gallery];
      const from = gallery.findIndex((g) => g.id === this.dragId);
      const to = gallery.findIndex((g) => g.id === targetId);
      if (from < 0 || to < 0) return p;
      const [moved] = gallery.splice(from, 1);
      gallery.splice(to, 0, moved);
      return { ...p, gallery: gallery.map((g, i) => ({ ...g, sortOrder: i })) };
    });
    this.dragId = null;
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
