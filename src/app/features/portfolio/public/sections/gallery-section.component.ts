import { Component, input, signal } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio, PortfolioGalleryItem } from '../../models/portfolio.model';
import { GalleryLightboxComponent } from './gallery-lightbox.component';
import { LucideAngularModule, Play } from 'lucide-angular';

@Component({
  selector: 'app-pf-gallery-section',
  standalone: true,
  imports: [ScrollRevealDirective, GalleryLightboxComponent, LucideAngularModule],
  templateUrl: './gallery-section.component.html'
})
export class GallerySectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly lightboxItem = signal<PortfolioGalleryItem | null>(null);
  readonly playIcon = Play;

  sortedGallery(): PortfolioGalleryItem[] {
    return [...this.portfolio().gallery].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  openLightbox(item: PortfolioGalleryItem): void {
    this.lightboxItem.set(item);
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
  }
}
