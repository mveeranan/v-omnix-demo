import { Component, signal, computed } from '@angular/core';
import { GalleryLightboxComponent } from '../gallery-lightbox.component';
import { GallerySectionBase } from './gallery-section-base';

/** Full-Bleed Slideshow — one large image at a time, dot navigation, click to expand. */
@Component({
  selector: 'app-gallery-slideshow',
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
        </div>

        <button type="button" class="gal-slideshow mt-12"
          [style.background-image]="'url(' + (active().thumbnailUrl || active().url) + ')'"
          (click)="openLightbox(active())"
        ></button>

        @if (items().length > 1) {
          <div class="gal-slideshow__dots">
            @for (item of items(); track item.id; let i = $index) {
              <button type="button" class="gal-slideshow__dot"
                [class.is-active]="activeIndex() === i"
                (click)="goTo(i); $event.stopPropagation()"
                [attr.aria-label]="'Slide ' + (i + 1)"
              ></button>
            }
          </div>
        }
        <app-gallery-lightbox [item]="lightboxItem()" (close)="closeLightbox()" />
      </section>
    }
  `,
  styles: `
    .gal-slideshow {
      display: block;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      height: 26rem;
      border: none;
      background-size: cover;
      background-position: center;
      cursor: pointer;
    }
    .gal-slideshow__dots {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.25rem;
    }
    .gal-slideshow__dot {
      width: 0.6rem; height: 0.6rem; padding: 0;
      border: none; border-radius: 50%;
      background: var(--mox-border, #d4d4d4); cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .gal-slideshow__dot.is-active { background: var(--mox-accent, #ff6f00); transform: scale(1.3); }
  `
})
export class GallerySlideshowComponent extends GallerySectionBase {
  readonly activeIndex = signal(0);

  readonly active = computed(() => {
    const list = this.items();
    const idx = Math.min(this.activeIndex(), list.length - 1);
    return list[Math.max(idx, 0)];
  });

  goTo(i: number): void {
    this.activeIndex.set(i);
  }
}
