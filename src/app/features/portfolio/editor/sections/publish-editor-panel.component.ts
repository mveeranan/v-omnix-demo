import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Rocket, ExternalLink } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '../../shared/ui/collapsible-section-card.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';

@Component({
  selector: 'app-publish-editor-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, CollapsibleSectionCardComponent],
  template: `
    <app-collapsible-section-card title="Publish" [icon]="icon" [expanded]="true">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          <div class="pf-editor-field">
            <span class="pf-editor-label">Portfolio URL slug</span>
            <div class="pf-editor-slug-input">
              <span class="pf-editor-slug-input__prefix">/portfolio/</span>
              <input
                class="pf-editor-input"
                [(ngModel)]="d.slug"
                (ngModelChange)="onSlugChange($event)"
                placeholder="my-business"
              />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">CTA button label</span>
            <input class="pf-editor-input" [(ngModel)]="d.cta.label" (ngModelChange)="sync()" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">CTA type</span>
            <select class="pf-editor-input" [(ngModel)]="d.cta.type" (ngModelChange)="sync()">
              <option value="whatsapp">WhatsApp</option>
              <option value="internal">In-app booking</option>
              <option value="customUrl">Custom URL</option>
            </select>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">CTA target (phone, path, or URL)</span>
            <input class="pf-editor-input" [(ngModel)]="d.cta.target" (ngModelChange)="sync()" />
          </div>
          <div class="pf-editor-actions">
            <button type="button" class="pf-editor-publish-btn" [disabled]="state.isSaving()" (click)="state.publish()">
              <lucide-icon [img]="rocketIcon" class="h-4 w-4" />
              {{ d.published ? 'Update published' : 'Publish portfolio' }}
            </button>
            @if (d.published && d.slug) {
              <a [routerLink]="['/portfolio', d.slug]" target="_blank" class="pf-editor-add-btn inline-flex items-center gap-2">
                <lucide-icon [img]="externalIcon" class="h-4 w-4" /> View live
              </a>
            }
          </div>
          @if (state.lastSavedAt()) {
            <p class="pf-editor-hint">Last saved {{ state.lastSavedAt() | date: 'short' }}</p>
          }
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class PublishEditorPanelComponent {
  readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Rocket;
  readonly rocketIcon = Rocket;
  readonly externalIcon = ExternalLink;

  onSlugChange(value: string): void {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    this.state.patchDraft((p) => ({ ...p, slug }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
