import { Component, HostListener, input, output } from '@angular/core';
import { PortfolioGalleryItem } from '../../models/portfolio.model';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-gallery-lightbox',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (item()) {
      <div
        class="pf-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        (click)="close.emit()"
        tabindex="0"
      >
        <button
          type="button"
          class="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          (click)="close.emit(); $event.stopPropagation()"
        >
          <lucide-icon [img]="xIcon" class="h-6 w-6" />
        </button>
        <div class="max-h-[90vh] max-w-5xl" (click)="$event.stopPropagation()">
          @if (item()!.type === 'video') {
            <video [src]="item()!.url" controls class="max-h-[85vh] w-full rounded-lg"></video>
          } @else {
            <img [src]="item()!.url" [alt]="item()!.category" class="max-h-[85vh] w-full rounded-lg object-contain" />
          }
          <p class="mt-3 text-center text-white/80">{{ item()!.category }}</p>
        </div>
      </div>
    }
  `
})
export class GalleryLightboxComponent {
  readonly item = input<PortfolioGalleryItem | null>(null);
  readonly close = output<void>();
  readonly xIcon = X;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.item()) {
      this.close.emit();
    }
  }
}
