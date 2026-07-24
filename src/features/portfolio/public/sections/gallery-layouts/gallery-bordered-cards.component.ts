import { Component } from '@angular/core';
import { GalleryLightboxComponent } from '../gallery-lightbox.component';
import { GallerySectionBase } from './gallery-section-base';

/** Bordered Card Grid — editorial, spaced cards with visible borders and captions. */
@Component({
  selector: 'app-gallery-bordered-cards',
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

          <div class="gal-cards mt-12">
            @for (item of items(); track item.id) {
              <button type="button" class="gal-card" (click)="openLightbox(item)">
                <span class="gal-card__media" [style.background-image]="'url(' + (item.thumbnailUrl || item.url) + ')'"></span>
                @if (item.category) {
                  <span class="gal-card__caption">{{ item.category }}</span>
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
    .gal-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      max-width: 80rem;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    @media (min-width: 768px) { .gal-cards { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 1100px) { .gal-cards { grid-template-columns: repeat(4, 1fr); } }

    .gal-card {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-radius, 8px);
      overflow: hidden;
      background: var(--mox-surface, #fff);
      cursor: pointer;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    .gal-card:hover { box-shadow: 0 10px 26px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .gal-card__media {
      aspect-ratio: 1 / 1;
      background-size: cover;
      background-position: center;
    }
    .gal-card__caption {
      padding: 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      color: var(--mox-text, #23232d);
      border-top: 1px solid var(--mox-border, #eaeaea);
    }
  `
})
export class GalleryBorderedCardsComponent extends GallerySectionBase {}
