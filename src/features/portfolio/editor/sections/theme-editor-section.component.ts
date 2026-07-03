import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Palette } from 'lucide-angular';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { ThemePresetsService } from '../../data-access/theme-presets.service';
import { WebsiteApiService } from '../../data-access/website-api.service';
import { PortfolioTheme } from '../../models/portfolio.model';
import {
  ThemeOverrides,
  extractThemeOverrides,
  mergeThemeWithPreset
} from '../../models/theme-preset.model';

interface ColorField {
  key: keyof ThemeOverrides & keyof PortfolioTheme;
  label: string;
}

const COLOR_FIELDS: ColorField[] = [
  { key: 'accentColor', label: 'Accent (buttons, links)' },
  { key: 'primaryColor', label: 'Primary (brand)' },
  { key: 'secondaryColor', label: 'Secondary (sale tags)' },
  { key: 'backgroundColor', label: 'Page background' },
  { key: 'surfaceColor', label: 'Card surface' },
  { key: 'textColor', label: 'Text' },
  { key: 'mutedTextColor', label: 'Muted text' },
  { key: 'borderColor', label: 'Borders' }
];

@Component({
  selector: 'app-theme-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <section class="pf-editor-section pf-theme-editor">
      <header class="pf-editor-section-header">
        <div class="flex items-center gap-2">
          <lucide-icon [img]="icon" class="h-5 w-5" />
          <h3 class="pf-editor-section-title">Theme &amp; Colors</h3>
        </div>
        <p class="pf-editor-muted text-sm">
          Pick a preset, then fine-tune any color. Changes apply to your whole store.
        </p>
      </header>

      @if (working(); as theme) {
        <div class="pf-editor-fields">
          <div class="pf-editor-field">
            <span class="pf-editor-label">Theme preset</span>
            <select
              class="pf-editor-input"
              [ngModel]="theme.presetId"
              (ngModelChange)="applyPreset($event)"
            >
              @for (preset of presets(); track preset.id) {
                <option [value]="preset.id">{{ preset.name }}</option>
              }
            </select>
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            @for (field of colorFields; track field.key) {
              <div class="pf-editor-field">
                <span class="pf-editor-label">{{ field.label }}</span>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    class="pf-theme-swatch"
                    [ngModel]="colorValue(theme, field.key)"
                    (ngModelChange)="patch(field.key, $event)"
                  />
                  <input
                    class="pf-editor-input flex-1"
                    [ngModel]="colorValue(theme, field.key)"
                    (ngModelChange)="patch(field.key, $event)"
                    placeholder="#000000"
                  />
                </div>
              </div>
            }
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Body font</span>
              <input
                class="pf-editor-input"
                [ngModel]="theme.fontFamily"
                (ngModelChange)="patch('fontFamily', $event)"
                placeholder='"Open Sans", sans-serif'
              />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Heading font</span>
              <input
                class="pf-editor-input"
                [ngModel]="theme.headingFontFamily ?? ''"
                (ngModelChange)="patch('headingFontFamily', $event)"
                placeholder="Poppins, sans-serif"
              />
            </div>
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Corner radius</span>
              <select
                class="pf-editor-input"
                [ngModel]="theme.borderRadius ?? '8px'"
                (ngModelChange)="patch('borderRadius', $event)"
              >
                <option value="0px">Square (0)</option>
                <option value="4px">Subtle (4px)</option>
                <option value="8px">Soft (8px)</option>
                <option value="12px">Round (12px)</option>
                <option value="16px">Extra round (16px)</option>
              </select>
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Button style</span>
              <select
                class="pf-editor-input"
                [ngModel]="theme.buttonStyle ?? 'rounded'"
                (ngModelChange)="patch('buttonStyle', $event)"
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              class="pf-editor-btn pf-editor-btn--primary"
              [disabled]="saving()"
              (click)="save()"
            >
              {{ saving() ? 'Saving…' : 'Save theme' }}
            </button>
            <button
              type="button"
              class="pf-editor-btn"
              [disabled]="saving()"
              (click)="resetToPreset()"
            >
              Reset to preset
            </button>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .pf-theme-editor { display: block; }
    .pf-theme-swatch {
      inline-size: 2.5rem;
      block-size: 2.5rem;
      padding: 0;
      border: 1px solid var(--mox-border, #e0e0e0);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }
  `
})
export class ThemeEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly themePresets = inject(ThemePresetsService);
  private readonly websiteApi = inject(WebsiteApiService);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  readonly icon = Palette;
  readonly colorFields = COLOR_FIELDS;
  readonly saving = signal(false);

  /** Local working copy — falls back to the current draft theme. */
  private readonly localTheme = signal<PortfolioTheme | null>(null);
  readonly working = computed<PortfolioTheme | null>(
    () => this.localTheme() ?? this.state.draft()?.theme ?? null
  );

  readonly presets = computed(() => this.themePresets.getCatalog());

  colorValue(theme: PortfolioTheme, key: ColorField['key']): string {
    const value = theme[key];
    return typeof value === 'string' && value ? value : '#000000';
  }

  patch(key: keyof PortfolioTheme, value: unknown): void {
    const current = this.working();
    if (!current) return;
    this.localTheme.set({ ...current, [key]: value } as PortfolioTheme);
    this.previewLocally();
  }

  applyPreset(presetId: string): void {
    const preset = this.themePresets.findById(presetId);
    if (!preset) return;
    this.localTheme.set(mergeThemeWithPreset(preset, null));
    this.previewLocally();
  }

  resetToPreset(): void {
    const current = this.working();
    if (!current) return;
    this.applyPreset(current.presetId);
  }

  save(): void {
    const theme = this.working();
    if (!theme) return;

    const tenantId = this.authService.resolveTenantId();
    if (!tenantId) {
      this.notifications.error('Could not resolve your workspace. Please sign in again.');
      return;
    }

    const preset = this.themePresets.findById(theme.presetId);
    const overrides = preset ? extractThemeOverrides(theme, preset) : null;

    this.saving.set(true);
    this.websiteApi
      .saveTheme({
        tenantId,
        presetId: theme.presetId,
        overrides: (overrides ?? {}) as Record<string, unknown>
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.state.applyDraftPartial({
            theme: { ...theme, overrides: (overrides ?? undefined) as Record<string, unknown> | undefined }
          });
          this.notifications.success('Theme saved');
        },
        error: (err: Error) => {
          this.saving.set(false);
          this.notifications.error(err.message || 'Failed to save theme');
        }
      });
  }

  /** Push the working theme into the draft so the live preview reflects edits immediately. */
  private previewLocally(): void {
    const theme = this.localTheme();
    if (!theme) return;
    this.state.applyDraftPartial({ theme });
  }
}
