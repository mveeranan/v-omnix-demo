import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChevronDown, ChevronUp, Hash, LayoutTemplate, LucideAngularModule, Plus, Trash2, Type } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioHero, PortfolioHeroSlide } from '../../models/portfolio.model';

@Component({
  selector: 'app-hero-editor-section',
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
    <app-website-section-shell sectionId="hero" title="Hero slideshow" [icon]="icon" [complete]="slideCount() > 0">
      <div view class="admin-detail-view admin-detail-view--rich">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="slidesIcon" label="Slides" [value]="slideCount() + ' on homepage'" [divider]="!!draft()?.hero?.secondaryCtaLabel" />
          @if (draft()?.hero?.secondaryCtaLabel) {
            <app-admin-detail-item [icon]="typeIcon" label="Secondary CTA" [value]="draft()?.hero?.secondaryCtaLabel" />
          }
        </app-admin-detail-card>
        @if ((draft()?.hero?.slides?.length ?? 0) > 0) {
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            @for (slide of draft()?.hero?.slides ?? []; track slide.id) {
              @if (slide.imageUrl) {
                <app-admin-detail-media [label]="slide.headline || 'Slide'" variant="card" fit="cover" [url]="slide.imageUrl" />
              }
            }
          </div>
        }
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show hero slideshow" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <p class="pf-editor-hint">Controls the full-width banner at the top of your homepage. Images here do not change Brand or Brand story.</p>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Eyebrow</span>
            <input class="pf-editor-input" [ngModel]="b.eyebrow" (ngModelChange)="patch({ eyebrow: $event })" placeholder="e.g. new collection" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Default headline (if a slide has no headline)</span>
            <div class="pf-editor-input-wrap">
              <lucide-icon [img]="typeIcon" />
              <input class="pf-editor-input" [ngModel]="b.headline" (ngModelChange)="patch({ headline: $event })" [placeholder]="draft()?.brand?.businessName" />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Default subheadline</span>
            <input class="pf-editor-input" [ngModel]="b.subheadline" (ngModelChange)="patch({ subheadline: $event })" [placeholder]="draft()?.brand?.tagline" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Secondary button label</span>
            <input class="pf-editor-input" [ngModel]="b.secondaryCtaLabel" (ngModelChange)="patch({ secondaryCtaLabel: $event })" />
          </div>

          <div class="pf-editor-field pf-hero-slides-section">
            <span class="pf-editor-label">Slides (homepage banner)</span>
            @if (!(b.slides?.length)) {
              <div class="pf-hero-slides-empty">
                <p class="pf-hero-slides-empty__text">Add slides to customize the hero banner on your homepage.</p>
                <button type="button" class="pf-editor-btn-secondary" (click)="addSlide()">
                  <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add first slide
                </button>
              </div>
            } @else {
              @for (slide of b.slides; track slide.id; let i = $index) {
                <div class="pf-editor-item-card pf-hero-slide-card">
                  <div class="pf-hero-slide-card__header">
                    <span class="pf-hero-slide-card__title">Slide {{ i + 1 }}</span>
                    <div class="pf-hero-slide-card__actions">
                      <div class="pf-hero-slide-card__sort" role="group" aria-label="Reorder slide">
                        <button
                          type="button"
                          class="pf-hero-slide-card__sort-btn"
                          (click)="moveSlideUp(slide.id)"
                          [disabled]="i === 0"
                          aria-label="Move slide up"
                        >
                          <lucide-icon [img]="upIcon" class="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          class="pf-hero-slide-card__sort-btn"
                          (click)="moveSlideDown(slide.id)"
                          [disabled]="i === (b.slides?.length ?? 0) - 1"
                          aria-label="Move slide down"
                        >
                          <lucide-icon [img]="downIcon" class="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        class="pf-hero-slide-card__delete"
                        (click)="removeSlide(slide.id)"
                        aria-label="Remove slide"
                      >
                        <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <app-media-upload-zone
                    label="Banner image for this slide"
                    [singleSlot]="true"
                    [previewUrl]="slide.imageUrl"
                    (fileSelected)="onSlideImageSelected(slide.id, $event)"
                    (cleared)="onSlideImageCleared(slide.id)"
                  />
                  <div class="pf-editor-field">
                    <span class="pf-editor-label">Headline</span>
                    <input class="pf-editor-input" [ngModel]="slide.headline" (ngModelChange)="updateSlide(slide.id, { headline: $event })" />
                  </div>
                  <div class="pf-editor-field">
                    <span class="pf-editor-label">Subheadline</span>
                    <input class="pf-editor-input" [ngModel]="slide.subheadline" (ngModelChange)="updateSlide(slide.id, { subheadline: $event })" />
                  </div>
                  <div class="pf-editor-field">
                    <span class="pf-editor-label">Shop button label</span>
                    <input class="pf-editor-input" [ngModel]="slide.ctaLabel" (ngModelChange)="updateSlide(slide.id, { ctaLabel: $event })" />
                  </div>
                </div>
              }
              <button type="button" class="pf-hero-add-slide" (click)="addSlide()">
                <lucide-icon [img]="plusIcon" class="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <span class="pf-hero-add-slide__label">Add another slide</span>
              </button>
            }
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-hero-slide-card__header {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      width: 100%;
      margin: -0.75rem -0.75rem 0.75rem;
      padding: 0.625rem 0.75rem;
      box-sizing: border-box;
      border-radius: 0.375rem 0.375rem 0 0;
      background: rgb(241 245 249);
      border-bottom: 1px solid rgb(226 232 240);
    }

    :host-context(.dark) .pf-hero-slide-card__header {
      background: rgb(24 24 27);
      border-bottom-color: rgb(63 63 70);
    }

    .pf-hero-slide-card__title {
      flex: 1 1 auto;
      min-width: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.75rem;
      color: rgb(51 65 85);
    }

    :host-context(.dark) .pf-hero-slide-card__title {
      color: rgb(212 212 216);
    }

    .pf-hero-slide-card__actions {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      flex: 0 0 auto;
      margin-left: auto;
      gap: 0.75rem;
    }

    .pf-hero-slide-card__delete {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 1.75rem;
      width: 1.75rem;
      padding: 0;
      border-radius: 0.375rem;
      border: 1px solid rgb(226 232 240);
      background: rgb(255 255 255);
      color: rgb(239 68 68);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    :host-context(.dark) .pf-hero-slide-card__delete {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
      color: rgb(248 113 113);
    }

    .pf-hero-slide-card__delete:hover {
      background: rgb(254 242 242);
      border-color: rgb(254 202 202);
      color: rgb(220 38 38);
    }

    :host-context(.dark) .pf-hero-slide-card__delete:hover {
      background: rgb(63 29 29);
      border-color: rgb(127 29 29);
      color: rgb(252 165 165);
    }

    .pf-hero-slide-card__sort {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      flex-shrink: 0;
      gap: 0.375rem;
    }

    .pf-hero-slide-card__sort-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      height: 1.75rem;
      width: 1.75rem;
      padding: 0;
      border-radius: 0.375rem;
      border: 1px solid rgb(203 213 225);
      background: rgb(226 232 240);
      color: rgb(71 85 105);
      cursor: pointer;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    :host-context(.dark) .pf-hero-slide-card__sort-btn {
      border-color: rgb(82 82 91);
      background: rgb(63 63 70);
      color: rgb(212 212 216);
    }

    .pf-hero-slide-card__sort-btn:hover:not(:disabled) {
      background: rgb(255 255 255);
      border-color: rgb(203 213 225);
      color: rgb(15 23 42);
    }

    :host-context(.dark) .pf-hero-slide-card__sort-btn:hover:not(:disabled) {
      background: rgb(39 39 42);
      border-color: rgb(113 113 122);
      color: rgb(250 250 250);
    }

    .pf-hero-slide-card__sort-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `
})
export class HeroEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly draft = this.state.draft;
  readonly icon = LayoutTemplate;
  readonly typeIcon = Type;
  readonly slidesIcon = Hash;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly upIcon = ChevronUp;
  readonly downIcon = ChevronDown;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioHero>('hero'));

  slideCount(): number {
    return this.draft()?.hero.slides?.length ?? 0;
  }

  patch(partial: Partial<PortfolioHero>): void {
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      ...partial,
      slides: partial.slides ?? b.slides ?? []
    }));
  }

  addSlide(): void {
    const slide: PortfolioHeroSlide = {
      id: crypto.randomUUID(),
      imageUrl: '',
      headline: '',
      subheadline: '',
      ctaLabel: 'Shop now',
      ctaTarget: ''
    };
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => {
      const slides = [...(b.slides ?? []), slide];
      return { ...b, slides: withSortOrder(slides) };
    });
  }

  removeSlide(id: string): void {
    this.sectionState.clearHeroPendingSlide(id);
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: withSortOrder((b.slides ?? []).filter((s) => s.id !== id))
    }));
  }

  moveSlideUp(id: string): void {
    this.reorderSlide(id, -1);
  }

  moveSlideDown(id: string): void {
    this.reorderSlide(id, 1);
  }

  updateSlide(id: string, partial: Partial<PortfolioHeroSlide>): void {
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: (b.slides ?? []).map((s) => (s.id === id ? { ...s, ...partial } : s))
    }));
  }

  onSlideImageSelected(slideId: string, event: { file: File; dataUrl: string }): void {
    this.sectionState.setHeroPendingSlideFile(slideId, event.file);
    this.updateSlide(slideId, { imageUrl: event.dataUrl });
  }

  onSlideImageCleared(slideId: string): void {
    this.sectionState.clearHeroPendingSlide(slideId);
    this.updateSlide(slideId, { imageUrl: '' });
  }

  private reorderSlide(id: string, direction: -1 | 1): void {
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => {
      const slides = [...(b.slides ?? [])];
      const index = slides.findIndex((slide) => slide.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= slides.length) {
        return b;
      }
      [slides[index], slides[targetIndex]] = [slides[targetIndex], slides[index]];
      return { ...b, slides: withSortOrder(slides) };
    });
  }
}

function withSortOrder(slides: PortfolioHeroSlide[]): PortfolioHeroSlide[] {
  return slides.map((slide, index) => ({ ...slide, sortOrder: index }));
}
