import { Component, computed, input } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { resolveLayoutStyle } from './layout-styles.registry';
import { resolveLayoutComponent } from './section-layout-map';

/**
 * Generic section dispatcher: given a section key, it reads the section's
 * chosen layout style off the portfolio, resolves the matching component from
 * SECTION_LAYOUT_MAP, and renders it — passing the shared input contract
 * (portfolio / storeSlug / enabled) through NgComponentOutlet.
 *
 * If no component is registered for the resolved style, it renders nothing
 * (the caller keeps its own @if visibility gate), so a not-yet-built style can
 * never blank the page — it simply falls through.
 */
@Component({
  selector: 'app-section-renderer',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    @if (component()) {
      <ng-container
        [ngComponentOutlet]="component()!"
        [ngComponentOutletInputs]="inputs()"
      />
    }
  `
})
export class SectionRendererComponent {
  /** Portfolio key the section's content lives under, e.g. "categoryShowcase". */
  readonly sectionKey = input.required<string>();
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  private readonly styleId = computed(() => {
    const section = (this.portfolio() as unknown as Record<string, { layoutStyle?: string }>)[
      this.sectionKey()
    ];
    return resolveLayoutStyle(this.sectionKey(), section?.layoutStyle);
  });

  readonly component = computed(() =>
    resolveLayoutComponent(this.sectionKey(), this.styleId())
  );

  readonly inputs = computed(() => ({
    portfolio: this.portfolio(),
    storeSlug: this.storeSlug(),
    enabled: this.enabled()
  }));
}
