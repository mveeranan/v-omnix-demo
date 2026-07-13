import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sparkles } from 'lucide-angular';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioNewArrivals } from '../../models/portfolio.model';

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
        <p class="pf-editor-view-text">{{ draft()?.newArrivals?.title }} — showing up to 8 newest products</p>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show new arrivals section"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Section title</span>
            <input
              class="pf-editor-input"
              [ngModel]="b.title"
              (ngModelChange)="patch({ title: $event })"
              placeholder="New Arrivals"
            />
          </div>
          <p class="pf-editor-hint">Shows up to 8 newest products automatically sorted by arrival date.</p>
        }
      </div>
    </app-website-section-shell>
  `
})
export class NewArrivalsEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Sparkles;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioNewArrivals>('newArrivals'));

  patch(partial: Partial<PortfolioNewArrivals>): void {
    this.sectionState.patchBuffer<PortfolioNewArrivals>('newArrivals', (b) => ({ ...b, ...partial }));
  }

  clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value || min));
  }
}
