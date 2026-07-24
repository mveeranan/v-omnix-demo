import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GalleryHorizontal, LucideAngularModule, Plus, Trash2 } from 'lucide-angular';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { NotificationService } from '@core/notifications/notification.service';
import { DocumentUploadService } from '@features/admin/data-access/document-upload.service';
import { FileCategory } from '@shared/models/enums/file-category.enum';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { GallerySectionBuffer, WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioGalleryItem } from '../../models/portfolio.model';
import { LAYOUT_STYLES } from '@features/store/section-layout/layout-styles.registry';

@Component({
  selector: 'app-gallery-editor-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    AdminDetailMediaComponent,
    MediaUploadZoneComponent
  ],
  template: `
    <app-website-section-shell sectionId="gallerySection" title="Gallery" [icon]="icon" [complete]="(draft()?.gallery?.length ?? 0) > 0">
      <div view class="admin-detail-view admin-detail-view--rich">
        @if ((draft()?.gallery?.length ?? 0) > 0) {
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            @for (item of draft()?.gallery ?? []; track item.id) {
              <app-admin-detail-media label="Gallery image" variant="card" fit="cover" [url]="item.url" />
            }
          </div>
        } @else {
          <p class="admin-detail-empty">No gallery images yet.</p>
        }
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show gallery section" [enabled]="b.gallerySection.enabled" (enabledChange)="patchSection({ enabled: $event })" />
          <p class="pf-editor-hint">A visual grid of lifestyle/product photos on your homepage.</p>

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="gal-display-name">Section heading</label>
            <input id="gal-display-name" class="pf-editor-input"
              [ngModel]="b.gallerySection.displayName ?? ''"
              (ngModelChange)="patchSection({ displayName: $event })"
              placeholder="e.g. Product Showcase" />
            <p class="pf-editor-hint mt-2">The heading shown above this section on your website.</p>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Layout style</span>
            <div class="pf-layout-picker">
              @for (style of layoutStyles; track style.id) {
                <button type="button" class="pf-layout-option"
                  [class.pf-layout-option--active]="activeLayout(b.gallerySection) === style.id"
                  (click)="patchSection({ layoutStyle: style.id })">
                  <span class="pf-layout-option__name">{{ style.label }}</span>
                  @if (style.hint) { <span class="pf-layout-option__hint">{{ style.hint }}</span> }
                </button>
              }
            </div>
            <p class="pf-editor-hint mt-2">Changes only how images are presented — your uploaded photos stay the same.</p>
          </div>

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="gal-item-limit">Images to display on website</label>
            <input id="gal-item-limit" type="number" min="1" class="pf-editor-input pf-editor-input--narrow"
              [ngModel]="b.gallerySection.itemLimit ?? b.gallery.length" (ngModelChange)="onItemLimitChange($event)" />
            <p class="pf-editor-hint mt-2">How many of your uploaded images to show. You've added {{ b.gallery.length }}.</p>
          </div>

          @for (item of b.gallery; track item.id; let i = $index) {
            <div class="pf-editor-item-card">
              <div class="flex items-center justify-between">
                <span class="pf-editor-label">Image {{ i + 1 }}</span>
                <button type="button" class="pf-editor-icon-btn" (click)="removeItem(item.id)" aria-label="Remove image">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
              <app-media-upload-zone
                label="Gallery image"
                [singleSlot]="true"
                [previewUrl]="item.url"
                (fileSelected)="onImageSelected(item.id, $event.file)"
                (cleared)="onImageCleared(item.id)"
              />
              <div class="pf-editor-field">
                <span class="pf-editor-label">Category (optional)</span>
                <input class="pf-editor-input" [ngModel]="item.category" (ngModelChange)="patchItem(item.id, { category: $event })" placeholder="e.g. Lifestyle" />
              </div>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" [ngModel]="item.featured" (ngModelChange)="patchItem(item.id, { featured: $event })" /> Featured (larger tile)
              </label>
            </div>
          }

          <button type="button" class="pf-hero-add-slide" (click)="addItem()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" />
            <span class="pf-hero-add-slide__label">Add image</span>
          </button>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-editor-input--narrow { max-width: 8rem; }

    .pf-layout-picker {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    .pf-layout-option {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0.9rem;
      text-align: left;
      background: var(--surface, #fff);
      border: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .pf-layout-option:hover {
      border-color: color-mix(in srgb, var(--primary, #ff6f00) 50%, var(--border-subtle, #e5e7eb));
    }
    .pf-layout-option--active {
      border-color: var(--primary, #ff6f00);
      box-shadow: 0 0 0 1px var(--primary, #ff6f00) inset;
      background: color-mix(in srgb, var(--primary, #ff6f00) 6%, transparent);
    }
    .pf-layout-option__name { font-size: 0.875rem; font-weight: 600; color: var(--text, #111827); }
    .pf-layout-option__hint { font-size: 0.72rem; color: var(--text-muted, #6b7280); line-height: 1.3; }

    .pf-editor-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 1.75rem;
      width: 1.75rem;
      border-radius: 0.375rem;
      border: 1px solid var(--border, rgb(226 232 240));
      background: transparent;
      color: rgb(239 68 68);
      cursor: pointer;
    }
    .pf-hero-add-slide {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 0.625rem;
      border: 1px dashed var(--border, rgb(203 213 225));
      background: transparent;
      cursor: pointer;
    }
  `
})
export class GalleryEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly documentUpload = inject(DocumentUploadService);
  private readonly notifications = inject(NotificationService);

  readonly draft = this.state.draft;
  readonly icon = GalleryHorizontal;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly layoutStyles = LAYOUT_STYLES['gallerySection'] ?? [];
  readonly buffer = computed(() => this.sectionState.buffer<GallerySectionBuffer>('gallerySection'));

  patchSection(partial: Partial<GallerySectionBuffer['gallerySection']>): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallerySection', (b) => ({
      ...b,
      gallerySection: { ...b.gallerySection, ...partial }
    }));
  }

  activeLayout(section: GallerySectionBuffer['gallerySection']): string {
    return section.layoutStyle || 'instagram-grid';
  }

  onItemLimitChange(value: number | string): void {
    const n = Math.max(1, Math.floor(Number(value) || 1));
    this.patchSection({ itemLimit: n });
  }

  addItem(): void {
    const item: PortfolioGalleryItem = {
      id: crypto.randomUUID(),
      type: 'image',
      url: '',
      thumbnailUrl: '',
      category: '',
      featured: false,
      sortOrder: 0
    };
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallerySection', (b) => {
      const gallery = [...b.gallery, item].map((g, i) => ({ ...g, sortOrder: i }));
      return { ...b, gallery };
    });
  }

  removeItem(id: string): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallerySection', (b) => ({
      ...b,
      gallery: b.gallery.filter((g) => g.id !== id).map((g, i) => ({ ...g, sortOrder: i }))
    }));
  }

  patchItem(id: string, partial: Partial<PortfolioGalleryItem>): void {
    this.sectionState.patchBuffer<GallerySectionBuffer>('gallerySection', (b) => ({
      ...b,
      gallery: b.gallery.map((g) => (g.id === id ? { ...g, ...partial } : g))
    }));
  }

  onImageSelected(id: string, file: File): void {
    this.documentUpload.upload(file, FileCategory.PortfolioImage).subscribe({
      next: (doc) => this.patchItem(id, { url: doc.url, thumbnailUrl: doc.url }),
      error: (err) => this.notifications.errorFromApi(err, 'Could not upload image.')
    });
  }

  onImageCleared(id: string): void {
    this.patchItem(id, { url: '', thumbnailUrl: '' });
  }
}
