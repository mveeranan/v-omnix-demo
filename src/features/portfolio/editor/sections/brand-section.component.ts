import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileText, LucideAngularModule, Quote, Sparkles, Type } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, BrandSectionBuffer } from '../../data-access/website-section-state.service';
import { ThemePresetsService } from '../../data-access/theme-presets.service';
import { PortfolioStoreDescription } from '../../models/portfolio.model';
import { ThemePresetDto } from '../../models/theme-preset.model';
import { resolvePortfolioThemeFromPresetId } from '../../shared/utils/theme-preset-resolve.util';

@Component({
  selector: 'app-brand-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    MediaUploadZoneComponent,
    AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="brand"
      title="Brand"
      [icon]="icon"
      [complete]="isComplete()"
    >
      <div view class="admin-detail-view admin-detail-view--rich">
        @if (saved(); as s) {
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-media label="Logo" variant="card" fit="contain" [url]="s.logoUrl" />
            <app-admin-detail-card>
              <app-admin-detail-item [icon]="nameIcon" label="Business Name" [value]="s.businessName" [divider]="true" />
              <app-admin-detail-item [icon]="taglineIcon" label="Tagline" [value]="s.tagline" />
            </app-admin-detail-card>
          </div>
          @if (presetDisplay(); as theme) {
            <app-admin-detail-card [full]="true" [stack]="false">
              <div class="brand-theme-row">
                <div class="brand-theme-row__item">
                  <span class="brand-theme-row__label">Primary</span>
                  <span class="brand-theme-row__swatch" [style.background]="theme.primaryColor" [title]="theme.primaryColor"></span>
                </div>
                <div class="brand-theme-row__item">
                  <span class="brand-theme-row__label">Accent</span>
                  <span class="brand-theme-row__swatch" [style.background]="theme.accentColor" [title]="theme.accentColor"></span>
                </div>
                <div class="brand-theme-row__item">
                  <span class="brand-theme-row__label">Font</span>
                  <span class="brand-theme-row__value">{{ theme.fontFamily }}</span>
                </div>
              </div>
            </app-admin-detail-card>
          }
        }
        @if (savedStory(); as story) {
          <p class="admin-detail-rich-subsection-label">Brand Story</p>
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-media label="Story Image" variant="card" fit="cover" [url]="story.imageUrl" />
            <app-admin-detail-card>
              <app-admin-detail-item [icon]="storyIcon" label="Description" [value]="story.description" [multiline]="true" />
            </app-admin-detail-card>
          </div>
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

          <p class="pf-editor-subsection-label">Theme</p>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Preset</span>
            <select class="pf-editor-input" [ngModel]="b.presetId" (ngModelChange)="selectPreset($event)">
              @for (preset of presets(); track preset.id) {
                <option [value]="preset.id">{{ preset.name }}</option>
              }
            </select>
          </div>
          @if (presetDisplay(); as theme) {
            <div class="brand-theme-row brand-theme-row--edit">
              <div class="brand-theme-row__item">
                <span class="brand-theme-row__label">Primary</span>
                <span class="brand-theme-row__swatch" [style.background]="theme.primaryColor" [title]="theme.primaryColor"></span>
              </div>
              <div class="brand-theme-row__item">
                <span class="brand-theme-row__label">Accent</span>
                <span class="brand-theme-row__swatch" [style.background]="theme.accentColor" [title]="theme.accentColor"></span>
              </div>
              <div class="brand-theme-row__item">
                <span class="brand-theme-row__label">Font</span>
                <span class="brand-theme-row__value">{{ theme.fontFamily }}</span>
              </div>
            </div>
          }

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
    .brand-theme-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem 2rem;
      width: 100%;
    }

    .brand-theme-row--edit {
      margin-top: 0.25rem;
      padding: 0.875rem 1rem;
      border-radius: 0.625rem;
      border: 1px solid rgb(226 232 240);
      background: rgb(248 250 252);
      box-sizing: border-box;
    }

    :host-context(.dark) .brand-theme-row--edit {
      border-color: rgb(63 63 70);
      background: rgb(24 24 27);
    }

    .brand-theme-row__item {
      display: inline-flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
    }

    .brand-theme-row__label {
      flex-shrink: 0;
      font-size: 0.75rem;
      font-weight: 500;
      color: rgb(100 116 139);
    }

    :host-context(.dark) .brand-theme-row__label {
      color: rgb(161 161 170);
    }

    .brand-theme-row__swatch {
      display: inline-block;
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 0.375rem;
      border: 1px solid rgb(203 213 225);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.2);
    }

    :host-context(.dark) .brand-theme-row__swatch {
      border-color: rgb(82 82 91);
    }

    .brand-theme-row__value {
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.25rem;
      color: rgb(51 65 85);
      word-break: break-word;
    }

    :host-context(.dark) .brand-theme-row__value {
      color: rgb(244 244 245);
    }
  `
})
export class BrandSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly themePresetsService = inject(ThemePresetsService);

  readonly draft = this.state.draft;
  readonly icon = Sparkles;
  readonly nameIcon = Type;
  readonly taglineIcon = Quote;
  readonly storyIcon = FileText;
  readonly presets = signal<ThemePresetDto[]>([]);

  readonly buffer = computed(() => this.sectionState.buffer<BrandSectionBuffer>('brand'));
  readonly saved = computed(() => this.draft()?.brand);
  readonly savedStory = computed(() => this.draft()?.storeDescription);

  readonly activePresetId = computed(() => {
    return this.buffer()?.presetId?.trim() || this.draft()?.theme.presetId?.trim() || '';
  });

  readonly presetDisplay = computed(() => {
    const presetId = this.activePresetId();
    if (!presetId) {
      return null;
    }
    const catalog = this.presets();
    const fromCatalog = catalog.find((preset) => preset.id === presetId);
    if (fromCatalog) {
      return {
        primaryColor: fromCatalog.primaryColor,
        accentColor: fromCatalog.accentColor,
        fontFamily: fromCatalog.fontFamily
      };
    }
    const resolved = resolvePortfolioThemeFromPresetId(presetId, catalog);
    return {
      primaryColor: resolved.primaryColor,
      accentColor: resolved.accentColor,
      fontFamily: resolved.fontFamily
    };
  });

  ngOnInit(): void {
    this.themePresetsService.list().subscribe({
      next: (presets) => this.presets.set(presets),
      error: () => undefined
    });
  }

  presetLabel(id: string): string {
    return this.presets().find((preset) => preset.id === id)?.name ?? id;
  }

  isComplete(): boolean {
    const draft = this.draft();
    if (!draft?.brand?.businessName?.trim() || !draft.brand.logoUrl?.trim()) {
      return false;
    }
    if (!draft.theme.presetId?.trim()) {
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

  selectPreset(presetId: string): void {
    this.sectionState.patchBuffer<BrandSectionBuffer>('brand', (b) => ({
      ...b,
      presetId
    }));
    this.state.applyDraftPartial({
      theme: this.themePresetsService.resolvePortfolioTheme(presetId)
    });
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
