import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sparkles } from 'lucide-angular';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioNewArrivals } from '../../models/portfolio.model';
import { LAYOUT_STYLES } from '@features/store/section-layout/layout-styles.registry';

@Component({
  selector: 'app-new-arrivals-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent],
  template: `
    <app-website-section-shell
      sectionId="newArrivals"
      title="New Arrivals"
      [icon]="icon"
      [complete]="true"
    >
      <div view class="pf-editor-view-summary">
        <p class="pf-editor-view-text">
          {{ draft()?.newArrivals?.displayName || draft()?.newArrivals?.title }} —
          {{ layoutLabel(draft()?.newArrivals?.layoutStyle) }} —
          showing up to {{ draft()?.newArrivals?.itemLimit || draft()?.newArrivals?.maxCount || 8 }} newest products
        </p>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show new arrivals section"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="na-display-name">Section heading</label>
            <input
              id="na-display-name"
              class="pf-editor-input"
              [ngModel]="b.displayName ?? ''"
              (ngModelChange)="patch({ displayName: $event })"
              placeholder="e.g. Just Landed"
            />
            <p class="pf-editor-hint mt-2">The heading shown above this section on your website.</p>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Layout style</span>
            <div class="pf-layout-picker">
              @for (style of layoutStyles; track style.id) {
                <button type="button" class="pf-layout-option"
                  [class.pf-layout-option--active]="activeLayout(b) === style.id"
                  (click)="patch({ layoutStyle: style.id })">
                  <span class="pf-layout-option__name">{{ style.label }}</span>
                  @if (style.hint) { <span class="pf-layout-option__hint">{{ style.hint }}</span> }
                </button>
              }
            </div>
            <p class="pf-editor-hint mt-2">Changes only how new arrivals are presented — the products stay the same.</p>
          </div>

          <div class="pf-editor-field">
            <label class="pf-editor-label" for="na-item-limit">Products to display on website</label>
            <input id="na-item-limit" type="number" min="1" class="pf-editor-input pf-editor-input--narrow"
              [ngModel]="b.itemLimit ?? b.maxCount ?? 8" (ngModelChange)="onItemLimitChange($event)" />
            <p class="pf-editor-hint mt-2">How many of the newest products to show.</p>
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-editor-input--narrow { max-width: 8rem; }

    .pf-layout-picker {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    .pf-layout-option {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0.9rem;
      text-align: left;
      background: var(--surface, #fff);
      border: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .pf-layout-option:hover {
      border-color: color-mix(in srgb, var(--primary, #ff6f00) 50%, var(--border-subtle, #e5e7eb));
    }
    .pf-layout-option--active {
      border-color: var(--primary, #ff6f00);
      box-shadow: 0 0 0 1px var(--primary, #ff6f00) inset;
      background: color-mix(in srgb, var(--primary, #ff6f00) 6%, transparent);
    }
    .pf-layout-option__name { font-size: 0.875rem; font-weight: 600; color: var(--text, #111827); }
    .pf-layout-option__hint { font-size: 0.72rem; color: var(--text-muted, #6b7280); line-height: 1.3; }
  `
})
export class NewArrivalsEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Sparkles;
  readonly layoutStyles = LAYOUT_STYLES['newArrivals'] ?? [];
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioNewArrivals>('newArrivals'));

  patch(partial: Partial<PortfolioNewArrivals>): void {
    this.sectionState.patchBuffer<PortfolioNewArrivals>('newArrivals', (b) => ({ ...b, ...partial }));
  }

  activeLayout(b: PortfolioNewArrivals): string {
    return b.layoutStyle || 'grid';
  }

  layoutLabel(styleId: string | null | undefined): string {
    const id = styleId || 'grid';
    return this.layoutStyles.find((s) => s.id === id)?.label ?? 'Standard Grid';
  }

  onItemLimitChange(value: number | string): void {
    const n = Math.max(1, Math.floor(Number(value) || 1));
    this.patch({ itemLimit: n });
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value || min));
  }
}
