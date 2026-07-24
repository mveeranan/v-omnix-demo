import { Component } from '@angular/core';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { GalleryLightboxComponent } from './gallery-lightbox.component';
import { LucideAngularModule, Play, Instagram } from 'lucide-angular';
import { GallerySectionBase } from './gallery-layouts/gallery-section-base';

@Component({
  selector: 'app-pf-gallery-section',
  standalone: true,
  imports: [ScrollRevealDirective, GalleryLightboxComponent, LucideAngularModule],
  templateUrl: './gallery-section.component.html',
  styles: `
    /* Full-bleed 6-across grid — exact match to the reference's
       "Follow Us On Instagram" gallery block (.ftco-gallery / .gallery). */
    .pf-gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      width: 100vw;
      margin-left: calc(-50vw + 50%);
    }
    @media (min-width: 768px) {
      .pf-gallery-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (min-width: 992px) {
      .pf-gallery-grid { grid-template-columns: repeat(6, 1fr); }
    }

    .pf-gallery-tile {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 16.875rem;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .pf-gallery-tile__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3.75rem;
      height: 3.75rem;
      color: #fff;
      background: var(--mox-accent, #dbcc8f);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.6s ease;
    }
    .pf-gallery-tile:hover .pf-gallery-tile__icon,
    .pf-gallery-tile:focus-visible .pf-gallery-tile__icon {
      opacity: 1;
    }
    @media (max-width: 991.98px) {
      .pf-gallery-tile__icon { opacity: 1; }
    }
  `
})
export class GallerySectionComponent extends GallerySectionBase {
  readonly playIcon = Play;
  readonly instagramIcon = Instagram;
}
