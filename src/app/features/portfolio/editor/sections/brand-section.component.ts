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
      [complete]="!!draft()?.brand?.businessName && !!draft()?.brand?.logoUrl"
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
            (fileSelected)="patchBrand({ logoUrl: $event.dataUrl })"
            (cleared)="patchBrand({ logoUrl: '' })"
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
  `
})
export class BrandSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Sparkles;

  readonly buffer = computed(() => this.sectionState.buffer<BrandSectionBuffer>('brand'));
  readonly saved = computed(() => this.draft()?.brand);
  readonly savedPrimaryColor = computed(() => this.draft()?.theme.primaryColor ?? '#000');

  patchBrand(partial: Partial<BrandSectionBuffer['brand']>): void {
    this.sectionState.patchBuffer<BrandSectionBuffer>('brand', (b) => ({
      ...b,
      brand: { ...b.brand, ...partial }
    }));
  }

  patchColor(color: string): void {
    this.sectionState.patchBuffer<BrandSectionBuffer>('brand', (b) => ({ ...b, primaryColor: color }));
  }
}
