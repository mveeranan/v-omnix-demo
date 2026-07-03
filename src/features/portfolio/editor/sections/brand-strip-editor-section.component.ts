import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Building2, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioBrandStrip, PortfolioBrandLogo } from '../../models/portfolio.model';

@Component({
  selector: 'app-brand-strip-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent],
  template: `
    <app-website-section-shell
      sectionId="brandStrip"
      title="Brands / Partners"
      [icon]="icon"
      [complete]="(draft()?.brandStrip?.logos?.length ?? 0) > 0"
    >
      <div view class="pf-editor-view-summary">
        <p class="pf-editor-view-text">{{ draft()?.brandStrip?.logos?.length ?? 0 }} logo(s) — {{ draft()?.brandStrip?.title }}</p>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show brands strip"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Section title</span>
            <input
              class="pf-editor-input"
              [ngModel]="b.title"
              (ngModelChange)="patch({ title: $event })"
              placeholder="Trusted Brands"
            />
          </div>

          <div class="pf-editor-list">
            @for (logo of b.logos; track logo.id; let i = $index) {
              <div class="pf-editor-list-item">
                <div class="pf-editor-list-item__fields">
                  <input
                    class="pf-editor-input"
                    [ngModel]="logo.name"
                    (ngModelChange)="patchLogo(b, i, { name: $event })"
                    placeholder="Brand name"
                  />
                  <input
                    class="pf-editor-input"
                    [ngModel]="logo.logoUrl"
                    (ngModelChange)="patchLogo(b, i, { logoUrl: $event })"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <button type="button" class="pf-editor-icon-btn pf-editor-icon-btn--danger" (click)="removeLogo(b, i)">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
            }
          </div>

          <button type="button" class="pf-editor-add-btn" (click)="addLogo(b)">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" />
            Add brand logo
          </button>
        }
      </div>
    </app-website-section-shell>
  `
})
export class BrandStripEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Building2;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioBrandStrip>('brandStrip'));

  patch(partial: Partial<PortfolioBrandStrip>): void {
    this.sectionState.patchBuffer<PortfolioBrandStrip>('brandStrip', (b) => ({ ...b, ...partial }));
  }

  patchLogo(b: PortfolioBrandStrip, index: number, partial: Partial<PortfolioBrandLogo>): void {
    const logos = b.logos.map((l, i) => i === index ? { ...l, ...partial } : l);
    this.patch({ logos });
  }

  addLogo(b: PortfolioBrandStrip): void {
    const newLogo: PortfolioBrandLogo = {
      id: crypto.randomUUID(),
      name: '',
      logoUrl: '',
      order: b.logos.length
    };
    this.patch({ logos: [...b.logos, newLogo] });
  }

  removeLogo(b: PortfolioBrandStrip, index: number): void {
    this.patch({ logos: b.logos.filter((_, i) => i !== index) });
  }
}
