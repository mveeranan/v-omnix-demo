import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sparkles } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { AdminDetailMediaComponent } from '../../../admin/shared/admin-detail-media.component';
import { MediaUploadZoneComponent } from '../../../../shared/ui/media-upload-zone.component';
import { SectionToggleComponent } from '../../shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '../shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, BrandSectionBuffer } from '../../data-access/website-section-state.service';
import { PortfolioStoreDescription } from '../../models/portfolio.model';

@Component({
  selector: 'app-brand-section',
  standalone: true,
  imports: [
    FormsModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    MediaUploadZoneComponent,
    AdminDetailFieldComponent,
    AdminDetailMediaComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="brand"
      title="Brand"
      [icon]="icon"
      [complete]="isComplete()"
    >
      <div view class="admin-detail-view">
        @if (saved(); as s) {
          <app-admin-detail-media label="Logo" [url]="s.logoUrl" />
          <app-admin-detail-field label="Business name" [value]="s.businessName" />
          <app-admin-detail-field label="Tagline" [value]="s.tagline" />
          <div class="pf-editor-color-preview">
            <span class="pf-editor-label">Primary color</span>
            <span class="pf-editor-color-preview__chip" [style.background]="savedPrimaryColor()"></span>
            <span class="pf-editor-color-preview__hex">{{ savedPrimaryColor() }}</span>
          </div>
        }
        @if (savedStory(); as story) {
          <p class="pf-editor-subsection-label">Brand story</p>
          <app-admin-detail-media label="Story image" [url]="story.imageUrl" />
          <app-admin-detail-field label="Description" [value]="story.description" [span2]="true" />
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show brand in header & footer"
            [enabled]="b.brand.enabled"
            (enabledChange)="patchBrand({ enabled: $event })"
          />
          <p class="pf-editor-hint">Logo, name, and tagline appear in the site header and footer — not in the hero banner.</p>
          <app-media-upload-zone
            label="Logo"
            [singleSlot]="true"
            [previewUrl]="b.brand.logoUrl"
            (fileSelected)="onLogoSelected($event)"
            (cleared)="onLogoCleared()"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Business name</span>
            <input class="pf-editor-input" [ngModel]="b.brand.businessName" (ngModelChange)="patchBrand({ businessName: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Tagline</span>
            <input class="pf-editor-input" [ngModel]="b.brand.tagline" (ngModelChange)="patchBrand({ tagline: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Primary color</span>
            <div class="pf-editor-color-row">
              <input type="color" class="pf-editor-color-input" [ngModel]="b.primaryColor" (ngModelChange)="patchColor($event)" />
              <span class="pf-editor-color-preview__chip" [style.background]="b.primaryColor"></span>
              <span class="pf-editor-color-preview__hex">{{ b.primaryColor }}</span>
            </div>
          </div>

          <p class="pf-editor-subsection-label">Brand story</p>
          <app-section-toggle
            label="Show brand story section"
            [enabled]="b.storeDescription.enabled"
            (enabledChange)="patchStoreDescription({ enabled: $event })"
          />
          <p class="pf-editor-hint">This is the “Our story” block on your homepage — separate from the hero slideshow.</p>
          <app-media-upload-zone
            label="Story image (optional)"
            [singleSlot]="true"
            [previewUrl]="b.storeDescription.imageUrl"
            (fileSelected)="onStoryImageSelected($event)"
            (cleared)="onStoryImageCleared()"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Your story</span>
            <textarea
              class="pf-editor-input pf-editor-textarea"
              [ngModel]="b.storeDescription.description"
              (ngModelChange)="patchStoreDescription({ description: $event })"
              rows="4"
              placeholder="Describe your products and what makes your store unique..."
            ></textarea>
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-editor-color-preview,
    .pf-editor-color-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pf-editor-color-preview__chip {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 0.375rem;
      border: 1px solid rgb(226 232 240);
    }

    .pf-editor-color-preview__hex {
      font-size: 0.8125rem;
      color: rgb(100 116 139);
      font-family: ui-monospace, monospace;
    }

    .pf-editor-subsection-label {
      margin: 1.25rem 0 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: rgb(51 65 85);
    }
  `
})
export class BrandSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Sparkles;

  readonly buffer = computed(() => this.sectionState.buffer<BrandSectionBuffer>('brand'));
  readonly saved = computed(() => this.draft()?.brand);
  readonly savedStory = computed(() => this.draft()?.storeDescription);
  readonly savedPrimaryColor = computed(() => this.draft()?.theme.primaryColor ?? '#000');

  isComplete(): boolean {
    const draft = this.draft();
    if (!draft?.brand?.businessName?.trim() || !draft.brand.logoUrl?.trim()) {
      return false;
    }
    if (draft.storeDescription.enabled && !draft.storeDescription.description?.trim()) {
      return false;
    }
    return true;
  }

  patchBrand(partial: Partial<BrandSectionBuffer['brand']>): void {
    this.sectionState.patchBuffer<BrandSectionBuffer>('brand', (b) => ({
      ...b,
      brand: { ...b.brand, ...partial }
    }));
  }

  patchColor(color: string): void {
    this.sectionState.patchBuffer<BrandSectionBuffer>('brand', (b) => ({ ...b, primaryColor: color }));
  }

  patchStoreDescription(partial: Partial<PortfolioStoreDescription>): void {
    this.sectionState.patchBuffer<BrandSectionBuffer>('brand', (b) => ({
      ...b,
      storeDescription: { ...b.storeDescription, ...partial }
    }));
  }

  onLogoSelected(event: { file: File; dataUrl: string }): void {
    this.sectionState.setBrandPendingLogo(event.file);
    this.patchBrand({ logoUrl: event.dataUrl });
  }

  onLogoCleared(): void {
    this.sectionState.clearBrandPendingLogo();
    this.patchBrand({ logoUrl: '' });
  }

  onStoryImageSelected(event: { file: File; dataUrl: string }): void {
    this.sectionState.setBrandPendingStoryImage(event.file);
    this.patchStoreDescription({ imageUrl: event.dataUrl });
  }

  onStoryImageCleared(): void {
    this.sectionState.clearBrandPendingStoryImage();
    this.patchStoreDescription({ imageUrl: '' });
  }
}
