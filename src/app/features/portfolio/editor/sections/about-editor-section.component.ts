import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileText } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '../../shared/ui/collapsible-section-card.component';
import { SectionToggleComponent } from '../../shared/ui/section-toggle.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';

@Component({
  selector: 'app-about-editor-section',
  standalone: true,
  imports: [FormsModule, CollapsibleSectionCardComponent, SectionToggleComponent],
  template: `
    <app-collapsible-section-card title="About" [icon]="icon" [complete]="!!draft()?.about?.description">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <app-section-toggle label="Show about section" [enabled]="d.about.enabled" (enabledChange)="setAboutEnabled($event)" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Description</span>
            <textarea
              class="pf-editor-input pf-editor-textarea"
              [(ngModel)]="d.about.description"
              (ngModelChange)="sync()"
            ></textarea>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Experience</span>
            <input class="pf-editor-input" [(ngModel)]="d.about.experience" (ngModelChange)="sync()" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Achievements (comma separated)</span>
            <input
              class="pf-editor-input"
              [ngModel]="achievementsText()"
              (ngModelChange)="setAchievements($event)"
            />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Certifications (comma separated)</span>
            <input class="pf-editor-input" [ngModel]="certsText()" (ngModelChange)="setCerts($event)" />
          </div>
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class AboutEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = FileText;

  achievementsText(): string {
    return this.draft()?.about.achievements.join(', ') ?? '';
  }

  certsText(): string {
    return this.draft()?.about.certifications.join(', ') ?? '';
  }

  setAchievements(value: string): void {
    const items = value.split(',').map((s) => s.trim()).filter(Boolean);
    this.state.patchDraft((p) => ({ ...p, about: { ...p.about, achievements: items } }));
  }

  setCerts(value: string): void {
    const items = value.split(',').map((s) => s.trim()).filter(Boolean);
    this.state.patchDraft((p) => ({ ...p, about: { ...p.about, certifications: items } }));
  }

  setAboutEnabled(enabled: boolean): void {
    this.state.patchDraft((p) => ({ ...p, about: { ...p.about, enabled } }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
