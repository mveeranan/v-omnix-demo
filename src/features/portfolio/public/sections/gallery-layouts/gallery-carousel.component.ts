import { Component } from '@angular/core';
import { GalleryLightboxComponent } from '../gallery-lightbox.component';
import { GallerySectionBase } from './gallery-section-base';

/** Carousel / Slider — a swipeable horizontal row of images, click to expand. */
@Component({
  selector: 'app-gallery-carousel',
  standalone: true,
  imports: [GalleryLightboxComponent],
  template: `
    @if (items().length) {
      <section class="pf-section" id="gallery">
        <div class="container mx-auto px-6">
          <div class="text-center">
            <p class="pf-eyebrow">Gallery</p>
            <h2 class="pf-display mt-2 text-3xl font-semibold md:text-4xl">{{ heading }}</h2>
          </div>

          <div class="gal-carousel mt-12" role="list">
            @for (item of items(); track item.id) {
              <button type="button" class="gal-carousel__cell" role="listitem"
                [style.background-image]="'url(' + (item.thumbnailUrl || item.url) + ')'"
                (click)="openLightbox(item)"
              ></button>
            }
          </div>
        </div>
        <app-gallery-lightbox [item]="lightboxItem()" (close)="closeLightbox()" />
      </section>
    }
  `,
  styles: `
    .gal-carousel {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 0 1.5rem 1rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .gal-carousel__cell {
      flex: 0 0 auto;
      width: 16rem;
      height: 16rem;
      scroll-snap-align: start;
      background-size: cover;
      background-position: center;
      border: none;
      border-radius: var(--mox-radius, 6px);
      cursor: pointer;
      transition: transform 0.25s ease;
    }
    .gal-carousel__cell:hover { transform: scale(1.03); }
    @media (max-width: 640px) {
      .gal-carousel__cell { width: 70vw; height: 70vw; }
    }
  `
})
export class GalleryCarouselComponent extends GallerySectionBase {}
