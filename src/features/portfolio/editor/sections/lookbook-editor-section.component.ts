import { Component, computed, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Image, Images, Trash2, Star, Type } from 'lucide-angular';

import { LucideAngularModule } from 'lucide-angular';

import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';

import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';

import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';

import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';

import { WebsiteSectionStateService, LookbookSectionBuffer } from '../../data-access/website-section-state.service';

import { PortfolioGalleryItem, PortfolioLookbook } from '../../models/portfolio.model';

import { captureVideoThumbnail, isGalleryImageThumbnail } from '@features/portfolio/shared/utils/video-thumbnail.util';



@Component({

  selector: 'app-lookbook-editor-section',

  standalone: true,

  imports: [

    FormsModule,

    LucideAngularModule,

    WebsiteSectionShellComponent,

    SectionToggleComponent,

    AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent,
    MediaUploadZoneComponent

  ],

  template: `

    <app-website-section-shell sectionId="lookbook" title="Lookbook gallery" [icon]="icon" [complete]="(buffer()?.gallery?.length ?? 0) > 0">

      <div view class="admin-detail-view admin-detail-view--rich">

        <div class="admin-detail-view__grid admin-detail-view__grid--2">

          <app-admin-detail-card>

            <app-admin-detail-item [icon]="titleIcon" label="Title" [value]="buffer()?.lookbook?.title" />

          </app-admin-detail-card>

          <app-admin-detail-card>

            <app-admin-detail-item [icon]="imagesIcon" label="Images" [value]="(buffer()?.gallery?.length ?? 0) + ' items'" />

          </app-admin-detail-card>

        </div>

      </div>

      <div edit class="pf-editor-fields">

        @if (buffer(); as b) {

          <app-section-toggle label="Show lookbook" [enabled]="b.lookbook.enabled" (enabledChange)="patchLookbook({ enabled: $event })" />

          <div class="pf-editor-field">

            <span class="pf-editor-label">Title</span>

            <input class="pf-editor-input" [ngModel]="b.lookbook.title" (ngModelChange)="patchLookbook({ title: $event })" />

          </div>

          <div class="pf-editor-field">

            <span class="pf-editor-label">Subtitle</span>

            <input class="pf-editor-input" [ngModel]="b.lookbook.subtitle" (ngModelChange)="patchLookbook({ subtitle: $event })" />

          </div>

          <app-media-upload-zone

            label="Add lifestyle image or video"

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

              <div class="pf-editor-gallery-item__actions">

                <button type="button" (click)="toggleFeatured(item.id)" [class.text-amber-500]="item.featured" aria-label="Featured">

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

export class LookbookEditorSectionComponent {

  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly icon = Image;

  readonly titleIcon = Type;

  readonly imagesIcon = Images;

  readonly starIcon = Star;

  readonly trashIcon = Trash2;

  readonly buffer = computed(() => this.sectionState.buffer<LookbookSectionBuffer>('lookbook'));



  patchLookbook(partial: Partial<PortfolioLookbook>): void {

    this.sectionState.patchBuffer<LookbookSectionBuffer>('lookbook', (b) => ({

      ...b,

      lookbook: { ...b.lookbook, ...partial },

      gallerySection: { ...b.gallerySection, enabled: true }

    }));

  }



  async onUpload(event: { dataUrl: string; file: File }): Promise<void> {

    const isVideo = event.file.type.startsWith('video/');

    let thumbnailUrl = event.dataUrl;

    if (isVideo) {

      try {

        thumbnailUrl = await captureVideoThumbnail(event.dataUrl);

      } catch {

        thumbnailUrl = '';

      }

    }

    const item: PortfolioGalleryItem = {

      id: crypto.randomUUID(),

      type: isVideo ? 'video' : 'image',

      url: event.dataUrl,

      thumbnailUrl,

      category: 'lookbook',

      featured: false,

      sortOrder: this.buffer()?.gallery.length ?? 0

    };

    this.sectionState.patchBuffer<LookbookSectionBuffer>('lookbook', (b) => ({

      ...b,

      gallery: [...b.gallery, item],

      gallerySection: { enabled: true }

    }));

  }



  remove(id: string): void {

    this.sectionState.patchBuffer<LookbookSectionBuffer>('lookbook', (b) => ({

      ...b,

      gallery: b.gallery.filter((g) => g.id !== id)

    }));

  }



  toggleFeatured(id: string): void {

    this.sectionState.patchBuffer<LookbookSectionBuffer>('lookbook', (b) => ({

      ...b,

      gallery: b.gallery.map((g) => (g.id === id ? { ...g, featured: !g.featured } : g))

    }));

  }



  hasImageThumbnail(item: PortfolioGalleryItem): boolean {

    return isGalleryImageThumbnail(item.thumbnailUrl, item.url);

  }

}

