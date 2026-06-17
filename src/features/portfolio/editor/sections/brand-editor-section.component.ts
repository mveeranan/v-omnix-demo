import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Palette, Sparkles } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';

@Component({
  selector: 'app-brand-editor-section',
  standalone: true,
  imports: [FormsModule, CollapsibleSectionCardComponent, MediaUploadZoneComponent],
  template: `
    <app-collapsible-section-card title="Brand" [icon]="sparklesIcon" [complete]="!!draft()?.brand?.businessName">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <app-media-upload-zone
            label="Logo"
            [singleSlot]="true"
            [previewUrl]="d.brand.logoUrl"
            (fileSelected)="onLogo($event.dataUrl)"
            (cleared)="patchBrand({ logoUrl: '' })"
          />
          <app-media-upload-zone
            label="Cover image"
            [singleSlot]="true"
            [previewUrl]="d.brand.coverImageUrl"
            (fileSelected)="onCover($event.dataUrl)"
            (cleared)="patchBrand({ coverImageUrl: '' })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Business name</span>
            <input class="pf-editor-input" [(ngModel)]="d.brand.businessName" (ngModelChange)="sync()" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Tagline</span>
            <input class="pf-editor-input" [(ngModel)]="d.brand.tagline" (ngModelChange)="sync()" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Primary theme color</span>
            <input
              type="color"
              class="pf-editor-color-input"
              [(ngModel)]="d.theme.primaryColor"
              (ngModelChange)="sync()"
            />
          </div>
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class BrandEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly sparklesIcon = Sparkles;
  readonly paletteIcon = Palette;

  patchBrand(partial: Partial<{ logoUrl: string; coverImageUrl: string }>): void {
    this.state.patchDraft((p) => ({ ...p, brand: { ...p.brand, ...partial } }));
  }

  onLogo(url: string): void {
    this.patchBrand({ logoUrl: url });
  }

  onCover(url: string): void {
    this.patchBrand({ coverImageUrl: url });
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
