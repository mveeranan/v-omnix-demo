import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Palette } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { WebsiteSectionShellComponent } from '../shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { ThemePresetsService } from '../../data-access/theme-presets.service';
import { PortfolioTheme } from '../../models/portfolio.model';
import { ThemePresetDto } from '../../models/theme-preset.model';
import { MOX_COLOR_SCHEMES } from '../../models/portfolio-theme.presets';
import { MOX_COLOR_SCHEME_ACCENTS } from '../../shared/utils/portfolio-theme.util';

@Component({
  selector: 'app-theme-editor-panel',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell sectionId="theme" title="Theme" [icon]="icon" [complete]="true">
      <div view class="admin-detail-view">
        @if (draft()?.theme; as t) {
          <app-admin-detail-field label="Preset" [value]="presetLabel(t.presetId)" />
          <div class="pf-theme-preview-row">
            <div class="pf-editor-color-preview">
              <span class="pf-editor-label">Primary</span>
              <span class="pf-editor-color-preview__chip" [style.background]="t.primaryColor"></span>
              <span class="pf-editor-color-preview__hex">{{ t.primaryColor }}</span>
            </div>
            <div class="pf-editor-color-preview">
              <span class="pf-editor-label">Accent</span>
              <span class="pf-editor-color-preview__chip" [style.background]="t.accentColor"></span>
              <span class="pf-editor-color-preview__hex">{{ t.accentColor }}</span>
            </div>
          </div>
          <app-admin-detail-field label="Font family" [value]="t.fontFamily" />
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as t) {
          <div class="pf-editor-field">
            <span class="pf-editor-label">Preset</span>
            <select class="pf-editor-input" [ngModel]="t.presetId" (ngModelChange)="applyPreset($event)">
              @for (preset of presets(); track preset.id) {
                <option [value]="preset.id">{{ preset.name }}</option>
              }
            </select>
          </div>
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Primary color</span>
              <div class="pf-editor-color-row">
                <input type="color" class="pf-editor-color-input" [ngModel]="t.primaryColor" (ngModelChange)="patch({ primaryColor: $event })" />
                <span class="pf-editor-color-preview__chip" [style.background]="t.primaryColor"></span>
              </div>
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Accent color</span>
              <div class="pf-editor-color-row">
                <input type="color" class="pf-editor-color-input" [ngModel]="t.accentColor" (ngModelChange)="patch({ accentColor: $event })" />
                <span class="pf-editor-color-preview__chip" [style.background]="t.accentColor"></span>
              </div>
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Font family</span>
            <input class="pf-editor-input" [ngModel]="t.fontFamily" (ngModelChange)="patch({ fontFamily: $event })" />
          </div>
          @if (t.presetId === 'mox-ecommerce') {
            <div class="pf-editor-field">
              <span class="pf-editor-label">Mox color scheme</span>
              <div class="pf-mox-schemes">
                @for (scheme of moxSchemes; track scheme.id) {
                  <button
                    type="button"
                    class="pf-mox-scheme"
                    [class.pf-mox-scheme--active]="t.colorScheme === scheme.id"
                    [style.--scheme-color]="scheme.accent"
                    (click)="applyColorScheme(scheme.id)"
                  >
                    <span class="pf-mox-scheme__swatch"></span>
                    {{ scheme.label }}
                  </button>
                }
              </div>
            </div>
          }
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-theme-preview-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

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

    .pf-mox-schemes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .pf-mox-scheme {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      border: 1px solid rgb(226 232 240);
      background: #fff;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .pf-mox-scheme--active {
      border-color: var(--scheme-color);
      box-shadow: 0 0 0 1px var(--scheme-color);
    }

    .pf-mox-scheme__swatch {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 999px;
      background: var(--scheme-color);
    }
  `
})
export class ThemeEditorPanelComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly themePresetsService = inject(ThemePresetsService);

  readonly draft = this.state.draft;
  readonly icon = Palette;
  readonly presets = signal<ThemePresetDto[]>([]);
  readonly moxSchemes = MOX_COLOR_SCHEMES;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioTheme>('theme'));

  ngOnInit(): void {
    this.themePresetsService.list().subscribe({
      next: (presets) => this.presets.set(presets),
      error: () => undefined
    });
  }

  presetLabel(id: string): string {
    return this.presets().find((p) => p.id === id)?.name ?? id;
  }

  applyPreset(id: string): void {
    const preset = this.presets().find((p) => p.id === id);
    if (!preset) return;
    this.sectionState.patchBuffer<PortfolioTheme>('theme', () =>
      this.themePresetsService.toPortfolioTheme(preset)
    );
  }

  patch(partial: Partial<PortfolioTheme>): void {
    this.sectionState.patchBuffer<PortfolioTheme>('theme', (t) => ({ ...t, ...partial }));
  }

  applyColorScheme(id: PortfolioTheme['colorScheme']): void {
    this.patch({
      colorScheme: id,
      accentColor: MOX_COLOR_SCHEME_ACCENTS[id]
    });
  }
}
