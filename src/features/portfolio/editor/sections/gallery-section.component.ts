import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Image, Trash2, Star } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, GallerySectionBuffer } from '../../data-access/website-section-state.service';
import { PortfolioGalleryItem } from '../../models/portfolio.model';
import { captureVideoThumbnail, isGalleryImageThumbnail } from '@features/portfolio/shared/utils/video-thumbnail.util';

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    MediaUploadZoneComponent,
    AdminDetailFieldComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="gallery"
      title="Gallery"
      [icon]="icon"
      [complete]="imageCount() >= 3"
    >
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Images" [value]="imageCount() + ' uploaded'" />
        <app-admin-detail-field label="Videos" [value]="videoCount() + ' uploaded'" />
        @if (draft()?.gallery?.length) {
          <div class="pf-gallery-view-grid">
            @for (item of draft()!.gallery.slice(0, 6); track item.id) {
              <img [src]="item.thumbnailUrl || item.url" class="pf-gallery-view-grid__thumb" alt="" />
            }
          </div>
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show gallery section"
            [enabled]="b.gallerySection.enabled"
            (enabledChange)="patchSection({ enabled: $event })"
          />
          <app-media-upload-zone
            label="Add image or video"
            accept="image/*,video/*"
            [singleSlot]="false"
            [clearAfterSelect]="true"
            (fileSelected)="onUpload($event)"
          />
          @for (item of b.gallery; track item.id) {
            <div class="pf-editor-item-card pf-editor-gallery-item">
              @if (item.type === 'video' && !hasImageThumbnail(item)) {
                <video [src]="item.url" muted playsinline preload="metadata" class="pf-editor-gallery-item__thumb"></video>
              } @else {
                <img [src]="item.thumbnailUrl || item.url" class="pf-editor-gallery-item__thumb" alt="" />
              }
              <div class="pf-editor-gallery-item__fields pf-editor-fields">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Category</span>
                  <input class="pf-editor-input" [ngModel]="item.category" (ngModelChange)="updateItem(item.id, { category: $event })" />
                </div>
              </div>
              <div class="pf-editor-gallery-item__actions">
                <button type="button" (click)="toggleFeatured(item.id)" [class.text-amber-500]="item.featured" aria-label="Toggle featured">
                  <lucide-icon [img]="starIcon" class="h-4 w-4" />
                </button>
                <button type="button" class="text-red-500" (click)="remove(item.id)" aria-label="Remove">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
            </div>
          }
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-gallery-view-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .pf-gallery-view-grid__thumb {
      aspect-ratio: 1;
      width: 100%;
      object-fit: cover;
      border-radius: 0.5rem;
    }
  `
})
export class GallerySectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Image;
  readonly trashIcon = Trash2;
  readonly starIcon = Star;

  readonly buffer = computed(() => this.sectionState.buffer<GallerySectionBuffer>('gallery'));
  readonly imageCount = computed(() => this.draft()?.gallery.filter((g) => g.type === 'image').length ?? 0);
  readonly videoCount = computed(() => this.draft()?.gallery.filter((g) => g.type === 'video').length ?? 0);

  patchSection(partial: Partial<GallerySectionBuffer['gallerySection']>): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallery', (b) => ({
      ...b,
      gallerySection: { ...b.gallerySection, ...partial }
    }));
  }

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
      category: 'Products',
      featured: false,
      sortOrder: this.buffer()?.gallery.length ?? 0
    };
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallery', (b) => ({
      ...b,
      gallery: [...b.gallery, item]
    }));
  }

  updateItem(id: string, partial: Partial<PortfolioGalleryItem>): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallery', (b) => ({
      ...b,
      gallery: b.gallery.map((g) => (g.id === id ? { ...g, ...partial } : g))
    }));
  }

  remove(id: string): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallery', (b) => ({
      ...b,
      gallery: b.gallery.filter((g) => g.id !== id)
    }));
  }

  toggleFeatured(id: string): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallery', (b) => ({
      ...b,
      gallery: b.gallery.map((g) => (g.id === id ? { ...g, featured: !g.featured } : g))
    }));
  }

  hasImageThumbnail(item: PortfolioGalleryItem): boolean {
    return isGalleryImageThumbnail(item.thumbnailUrl, item.url);
  }
}
