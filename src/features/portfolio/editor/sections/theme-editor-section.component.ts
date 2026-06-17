import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Palette } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { PORTFOLIO_THEME_PRESETS } from '../../models/portfolio-theme.presets';

@Component({
  selector: 'app-theme-editor-section',
  standalone: true,
  imports: [FormsModule, CollapsibleSectionCardComponent, SectionToggleComponent],
  template: `
    <app-collapsible-section-card title="Theme" [icon]="icon">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <div class="pf-editor-field">
            <span class="pf-editor-label">Preset</span>
            <select class="pf-editor-input" [ngModel]="d.theme.presetId" (ngModelChange)="applyPreset($event)">
              @for (preset of presets; track preset.id) {
                <option [value]="preset.id">{{ preset.label }}</option>
              }
            </select>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Primary color</span>
            <input
              type="color"
              class="pf-editor-color-input"
              [(ngModel)]="d.theme.primaryColor"
              (ngModelChange)="sync()"
            />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Accent color</span>
            <input
              type="color"
              class="pf-editor-color-input"
              [(ngModel)]="d.theme.accentColor"
              (ngModelChange)="sync()"
            />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Border radius</span>
            <input
              class="pf-editor-input"
              [(ngModel)]="d.theme.borderRadius"
              (ngModelChange)="sync()"
              placeholder="0.75rem"
            />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Font family</span>
            <input class="pf-editor-input" [(ngModel)]="d.theme.fontFamily" (ngModelChange)="sync()" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Mode</span>
            <select class="pf-editor-input" [(ngModel)]="d.theme.mode" (ngModelChange)="sync()">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <app-section-toggle label="Show stats section" [enabled]="d.stats.enabled" (enabledChange)="setStatsEnabled($event)" />
          @if (d.stats.enabled) {
            <div class="pf-editor-fields-grid pf-editor-fields-grid--3">
              <div class="pf-editor-field">
                <span class="pf-editor-label">Total orders</span>
                <input
                  type="number"
                  class="pf-editor-input"
                  [(ngModel)]="d.stats.totalOrders"
                  (ngModelChange)="sync()"
                />
              </div>
              <div class="pf-editor-field">
                <span class="pf-editor-label">Years in business</span>
                <input
                  type="number"
                  class="pf-editor-input"
                  [(ngModel)]="d.stats.yearsExperience"
                  (ngModelChange)="sync()"
                />
              </div>
              <div class="pf-editor-field">
                <span class="pf-editor-label">Total customers</span>
                <input
                  type="number"
                  class="pf-editor-input"
                  [(ngModel)]="d.stats.totalCustomers"
                  (ngModelChange)="sync()"
                />
              </div>
            </div>
          }
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class ThemeEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Palette;
  readonly presets = PORTFOLIO_THEME_PRESETS;

  applyPreset(id: string): void {
    const preset = this.presets.find((p) => p.id === id);
    if (!preset) return;
    this.state.patchDraft((p) => ({ ...p, theme: { ...preset.theme } }));
  }

  setStatsEnabled(enabled: boolean): void {
    this.state.patchDraft((p) => ({ ...p, stats: { ...p.stats, enabled } }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
