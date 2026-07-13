import { Component, input, signal, OnInit, OnDestroy } from '@angular/core';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { Portfolio, PortfolioGalleryItem } from '../../models/portfolio.model';
import { GalleryLightboxComponent } from './gallery-lightbox.component';
import { LucideAngularModule, Play } from 'lucide-angular';
import { isGalleryImageThumbnail } from '@features/portfolio/shared/utils/video-thumbnail.util';

@Component({
  selector: 'app-pf-gallery-section',
  standalone: true,
  imports: [ScrollRevealDirective, GalleryLightboxComponent, LucideAngularModule],
  templateUrl: './gallery-section.component.html',
  styles: `
    .pf-gallery-slider {
      position: relative;
      overflow: hidden;
      width: 100vw;
      margin-left: calc(-50vw + 50%);
      min-height: 24rem;
      background: #f5f5f5;
    }

    .pf-gallery-slide {
      position: absolute;
      inset: 0;
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pf-gallery-slide--active {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
      z-index: 1;
    }

    .pf-gallery-slide img,
    .pf-gallery-slide video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      background: white;
    }

    .pf-gallery-overlay {
      display: none;
    }
  `
})
export class GallerySectionComponent implements OnInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();
  readonly lightboxItem = signal<PortfolioGalleryItem | null>(null);
  readonly activeIndex = signal(0);
  readonly playIcon = Play;

  private rotateTimer?: ReturnType<typeof setInterval>;

  sortedGallery(): PortfolioGalleryItem[] {
    return [...this.portfolio().gallery].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  ngOnInit(): void {
    const gallery = this.sortedGallery();
    if (gallery.length > 1) {
      this.rotateTimer = setInterval(() => {
        const current = this.activeIndex();
        this.activeIndex.set((current + 1) % gallery.length);
      }, 6000);
    }
  }

  ngOnDestroy(): void {
    if (this.rotateTimer) clearInterval(this.rotateTimer);
  }

  openLightbox(item: PortfolioGalleryItem): void {
    this.lightboxItem.set(item);
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
  }

  hasImageThumbnail(item: PortfolioGalleryItem): boolean {
    return isGalleryImageThumbnail(item.thumbnailUrl, item.url);
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
  }
}
