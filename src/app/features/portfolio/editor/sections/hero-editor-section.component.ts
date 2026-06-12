import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutTemplate, LucideAngularModule, Type } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '../../shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '../shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioHero } from '../../models/portfolio.model';

@Component({
  selector: 'app-hero-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell sectionId="hero" title="Hero banner" [icon]="icon" [complete]="!!draft()?.hero?.headline">
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Eyebrow" [value]="draft()?.hero?.eyebrow" />
        <app-admin-detail-field label="Headline" [value]="displayHeadline()" />
        <app-admin-detail-field label="Subheadline" [value]="displaySubheadline()" />
        <app-admin-detail-field label="Secondary CTA" [value]="draft()?.hero?.secondaryCtaLabel" />
        <app-admin-detail-field label="Trust strip" [value]="draft()?.hero?.showTrustStrip ? 'Shown' : 'Hidden'" />
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show hero section" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Eyebrow (e.g. special offer)</span>
            <input class="pf-editor-input" [ngModel]="b.eyebrow" (ngModelChange)="patch({ eyebrow: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Headline (defaults to business name)</span>
            <div class="pf-editor-input-wrap">
              <lucide-icon [img]="typeIcon" />
              <input class="pf-editor-input" [ngModel]="b.headline" (ngModelChange)="patch({ headline: $event })" [placeholder]="draft()?.brand?.businessName" />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Subheadline (defaults to tagline)</span>
            <div class="pf-editor-input-wrap">
              <lucide-icon [img]="typeIcon" />
              <input class="pf-editor-input" [ngModel]="b.subheadline" (ngModelChange)="patch({ subheadline: $event })" [placeholder]="draft()?.brand?.tagline" />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Secondary button label</span>
            <div class="pf-editor-input-wrap">
              <lucide-icon [img]="typeIcon" />
              <input class="pf-editor-input" [ngModel]="b.secondaryCtaLabel" (ngModelChange)="patch({ secondaryCtaLabel: $event })" />
            </div>
          </div>
          <app-section-toggle label="Show trust badges under hero" [enabled]="b.showTrustStrip" (enabledChange)="patch({ showTrustStrip: $event })" />
          <p class="pf-editor-hint">Cover image and logo are edited in the Brand section. Primary CTA is configured in Publish.</p>
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
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioHero>('hero'));

  displayHeadline(): string {
    const h = this.draft()?.hero;
    return h?.headline?.trim() || this.draft()?.brand.businessName || '—';
  }

  displaySubheadline(): string {
    const h = this.draft()?.hero;
    return h?.subheadline?.trim() || this.draft()?.brand.tagline || '—';
  }

  patch(partial: Partial<PortfolioHero>): void {
    this.sectionState.patchBuffer<PortfolioHero>('hero', (b) => ({ ...b, ...partial }));
  }
}
