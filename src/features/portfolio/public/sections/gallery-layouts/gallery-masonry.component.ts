import { Component } from '@angular/core';
import { LucideAngularModule, Play, Instagram } from 'lucide-angular';
import { GalleryLightboxComponent } from '../gallery-lightbox.component';
import { GallerySectionBase } from './gallery-section-base';

/** Masonry — mixed-height tiles in a CSS-columns flow, click to expand. */
@Component({
  selector: 'app-gallery-masonry',
  standalone: true,
  imports: [GalleryLightboxComponent, LucideAngularModule],
  template: `
    @if (items().length) {
      <section class="pf-section" id="gallery">
        <div class="container mx-auto px-6">
          <div class="text-center">
            <p class="pf-eyebrow">Gallery</p>
            <h2 class="pf-display mt-2 text-3xl font-semibold md:text-4xl">{{ heading }}</h2>
          </div>

          <div class="gal-masonry mt-12">
            @for (item of items(); track item.id; let i = $index) {
              <button type="button" class="gal-masonry__tile"
                [class.gal-masonry__tile--tall]="i % 3 === 1"
                [style.background-image]="'url(' + (item.thumbnailUrl || item.url) + ')'"
                (click)="openLightbox(item)"
              >
                @if (item.type === 'video') {
                  <span class="gal-masonry__icon"><lucide-icon [img]="playIcon" class="h-6 w-6" /></span>
                }
              </button>
            }
          </div>
        </div>
        <app-gallery-lightbox [item]="lightboxItem()" (close)="closeLightbox()" />
      </section>
    }
  `,
  styles: `
    .gal-masonry {
      column-count: 2;
      column-gap: 1rem;
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    @media (min-width: 768px) { .gal-masonry { column-count: 3; } }
    @media (min-width: 1100px) { .gal-masonry { column-count: 4; } }

    .gal-masonry__tile {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      break-inside: avoid;
      margin-bottom: 1rem;
      height: 12rem;
      background-size: cover;
      background-position: center;
      border: none;
      border-radius: var(--mox-radius, 6px);
      cursor: pointer;
      overflow: hidden;
    }
    .gal-masonry__tile--tall { height: 18rem; }
    .gal-masonry__icon {
      display: flex; align-items: center; justify-content: center;
      width: 3rem; height: 3rem; color: #fff;
      background: rgba(0,0,0,0.5); border-radius: 50%;
    }
  `
})
export class GalleryMasonryComponent extends GallerySectionBase {
  readonly playIcon = Play;
  readonly instagramIcon = Instagram;
}
