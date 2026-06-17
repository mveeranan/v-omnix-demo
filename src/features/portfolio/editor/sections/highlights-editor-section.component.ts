import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Award, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';

@Component({
  selector: 'app-highlights-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CollapsibleSectionCardComponent, SectionToggleComponent],
  template: `
    <app-collapsible-section-card title="Why choose us" [icon]="icon" [complete]="(draft()?.highlights?.items?.length ?? 0) > 0">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <app-section-toggle label="Show highlights section" [enabled]="d.highlights.enabled" (enabledChange)="setEnabled($event)" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Section title</span>
            <input class="pf-editor-input" [(ngModel)]="d.highlights.title" (ngModelChange)="sync()" />
          </div>
          @for (item of d.highlights.items; track $index; let i = $index) {
            <div class="pf-editor-inline-field">
              <div class="pf-editor-field pf-editor-field--grow">
                <span class="pf-editor-label">Highlight {{ i + 1 }}</span>
                <input class="pf-editor-input" [(ngModel)]="d.highlights.items[i]" (ngModelChange)="sync()" />
              </div>
              <button type="button" class="text-red-500" (click)="remove(i)" aria-label="Remove highlight">
                <lucide-icon [img]="trashIcon" class="h-4 w-4" />
              </button>
            </div>
          }
          <button type="button" class="pf-editor-add-btn" (click)="add()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add highlight
          </button>
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class HighlightsEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Award;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;

  setEnabled(enabled: boolean): void {
    this.state.patchDraft((p) => ({ ...p, highlights: { ...p.highlights, enabled } }));
  }

  add(): void {
    this.state.patchDraft((p) => ({
      ...p,
      highlights: { ...p.highlights, items: [...p.highlights.items, ''] }
    }));
  }

  remove(index: number): void {
    this.state.patchDraft((p) => ({
      ...p,
      highlights: { ...p.highlights, items: p.highlights.items.filter((_, i) => i !== index) }
    }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
