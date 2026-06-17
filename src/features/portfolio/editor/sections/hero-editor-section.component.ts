import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutTemplate, LucideAngularModule, Plus, Trash2, Type } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { AdminDetailMediaComponent } from '../../../admin/shared/admin-detail-media.component';
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
    AdminDetailFieldComponent,
    AdminDetailMediaComponent,
    MediaUploadZoneComponent
  ],
  template: `
    <app-website-section-shell sectionId="hero" title="Hero slideshow" [icon]="icon" [complete]="slideCount() > 0">
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Slides" [value]="slideCount() + ' on homepage'" />
        @for (slide of draft()?.hero?.slides ?? []; track slide.id) {
          @if (slide.imageUrl) {
            <app-admin-detail-media [label]="slide.headline || 'Slide'" [url]="slide.imageUrl" />
          }
        }
        <app-admin-detail-field label="Secondary CTA" [value]="draft()?.hero?.secondaryCtaLabel" />
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

          <div class="pf-editor-field">
            <div class="flex items-center justify-between gap-2">
              <span class="pf-editor-label">Slides (homepage banner)</span>
              <button type="button" class="pf-editor-btn-secondary" (click)="addSlide()">
                <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add slide
              </button>
            </div>
            @if (!(b.slides?.length)) {
              <p class="pf-editor-muted mt-2 text-sm">No slides yet — add one to customize the hero banner.</p>
            }
            @for (slide of b.slides; track slide.id) {
              <div class="pf-editor-item-card mt-3">
                <div class="pf-editor-item-card__actions">
                  <button type="button" class="text-red-500" (click)="removeSlide(slide.id)" aria-label="Remove slide">
                    <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                  </button>
                </div>
                <app-media-upload-zone
                  label="Banner image for this slide"
                  [singleSlot]="true"
                  [previewUrl]="slide.imageUrl"
                  (fileSelected)="updateSlide(slide.id, { imageUrl: $event.dataUrl })"
                  (cleared)="updateSlide(slide.id, { imageUrl: '' })"
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
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class HeroEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly draft = this.state.draft;
  readonly icon = LayoutTemplate;
  readonly typeIcon = Type;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
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
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: [...(b.slides ?? []), slide]
    }));
  }

  removeSlide(id: string): void {
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: (b.slides ?? []).filter((s) => s.id !== id)
    }));
  }

  updateSlide(id: string, partial: Partial<PortfolioHeroSlide>): void {
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({
      ...b,
      slides: (b.slides ?? []).map((s) => (s.id === id ? { ...s, ...partial } : s))
    }));
  }
}
