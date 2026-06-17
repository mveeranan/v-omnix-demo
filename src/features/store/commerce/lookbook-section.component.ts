import { Component, input, signal } from '@angular/core';
import { Portfolio, PortfolioGalleryItem } from '../../portfolio/models/portfolio.model';
import { GalleryLightboxComponent } from '../../portfolio/public/sections/gallery-lightbox.component';
import { LucideAngularModule, Play } from 'lucide-angular';
import { isGalleryImageThumbnail } from '../../portfolio/shared/utils/video-thumbnail.util';

@Component({
  selector: 'app-lookbook-section',
  standalone: true,
  imports: [GalleryLightboxComponent, LucideAngularModule],
  template: `
    @if (enabled() && items().length) {
      <section class="mox-section" id="lookbook">
        <div class="container mx-auto px-6">
          <header class="mox-sale-section__header mb-8 text-center">
            <h2 class="mox-sale-section__title">{{ portfolio().lookbook.title }}</h2>
            @if (portfolio().lookbook.subtitle) {
              <p class="mox-sale-section__subtitle">{{ portfolio().lookbook.subtitle }}</p>
            }
          </header>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (item of items(); track item.id) {
              <button
                type="button"
                class="mox-card relative aspect-[4/3] overflow-hidden p-0"
                (click)="openLightbox(item)"
              >
                @if (hasImageThumbnail(item)) {
                  <img [src]="item.thumbnailUrl || item.url" [alt]="item.category" class="h-full w-full object-cover" loading="lazy" />
                } @else {
                  <div class="flex h-full w-full items-center justify-center bg-neutral-900">
                    <lucide-icon [img]="playIcon" class="h-10 w-10 text-white" />
                  </div>
                }
              </button>
            }
          </div>
        </div>
      </section>
      @if (lightboxItem(); as item) {
        <app-gallery-lightbox [item]="item" (close)="closeLightbox()" />
      }
    }
  `
})
export class LookbookSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly enabled = input(true);
  readonly lightboxItem = signal<PortfolioGalleryItem | null>(null);
  readonly playIcon = Play;

  items(): PortfolioGalleryItem[] {
    if (!this.enabled() || !this.portfolio().lookbook.enabled) {
      return [];
    }
    return [...this.portfolio().gallery].sort((a, b) => a.sortOrder - b.sortOrder);
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
}
