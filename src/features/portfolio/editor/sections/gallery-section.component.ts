import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Image, Trash2, Star, Video } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
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
    AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="gallery"
      title="Gallery"
      [icon]="icon"
      [complete]="imageCount() >= 3"
    >
      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="imageIcon" label="Images" [value]="imageCount() + ' uploaded'" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="videoIcon" label="Videos" [value]="videoCount() + ' uploaded'" />
          </app-admin-detail-card>
        </div>
        @if (draft()?.gallery?.length) {
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            @for (item of draft()!.gallery.slice(0, 6); track item.id) {
              <app-admin-detail-media
                [label]="item.category?.trim() || (item.type === 'video' ? 'Video' : 'Image')"
                variant="card"
                fit="cover"
                [url]="item.thumbnailUrl || item.url"
              />
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
  `
})
export class GallerySectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Image;
  readonly imageIcon = Image;
  readonly videoIcon = Video;
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
