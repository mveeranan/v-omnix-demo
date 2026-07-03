import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CircleDot, ExternalLink, Link, MousePointerClick, Rocket, Tag, Target } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, PublishSectionBuffer } from '../../data-access/website-section-state.service';
import { normalizeSlug } from '../../data-access/website-section.validators';

@Component({
  selector: 'app-publish-editor-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="publish"
      title="Publish"
      [icon]="icon"
      [complete]="!!draft()?.published"
      [alwaysOpen]="true"
    >
      <div view class="admin-detail-view admin-detail-view--rich">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item
            [icon]="storeUrlIcon"
            label="Store URL"
            [value]="'/store/' + (draft()?.slug || '')"
            [divider]="true"
          />
          <app-admin-detail-item
            [icon]="statusIcon"
            label="Status"
            [value]="draft()?.published ? 'Published' : 'Draft'"
          />
        </app-admin-detail-card>
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="ctaLabelIcon" label="CTA label" [value]="draft()?.cta?.label" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="ctaTypeIcon" label="CTA type" [value]="draft()?.cta?.type" />
          </app-admin-detail-card>
        </div>
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="ctaTargetIcon" label="CTA target" [value]="draft()?.cta?.target" />
        </app-admin-detail-card>
        @if (draft()?.published && draft()?.slug) {
          <div class="mt-3 flex flex-wrap gap-2">
            <a [routerLink]="['/store', draft()!.slug]" target="_blank" class="pf-editor-add-btn inline-flex items-center gap-2">
              <lucide-icon [img]="externalIcon" class="h-4 w-4" /> Company website
            </a>
            <a [routerLink]="['/store', draft()!.slug, 'products']" target="_blank" class="pf-editor-add-btn inline-flex items-center gap-2">
              <lucide-icon [img]="externalIcon" class="h-4 w-4" /> Shop (catalog)
            </a>
          </div>
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <div class="pf-editor-field">
            <span class="pf-editor-label">Store URL slug</span>
            <div class="pf-editor-slug-input">
              <span class="pf-editor-slug-input__prefix">/store/</span>
              <input
                class="pf-editor-input"
                [ngModel]="b.slug"
                (ngModelChange)="patch({ slug: normalizeSlug($event) })"
                placeholder="my-store"
              />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">CTA button label</span>
            <input class="pf-editor-input" [ngModel]="b.cta.label" (ngModelChange)="patchCta({ label: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">CTA type</span>
            <select class="pf-editor-input" [ngModel]="b.cta.type" (ngModelChange)="patchCta({ type: $event })">
              <option value="whatsapp">WhatsApp</option>
              <option value="internal">Storefront link</option>
              <option value="customUrl">Custom URL</option>
            </select>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">CTA target (phone, path, or URL)</span>
            <input class="pf-editor-input" [ngModel]="b.cta.target" (ngModelChange)="patchCta({ target: $event })" />
          </div>
        }
      </div>
    </app-website-section-shell>

    <div class="pf-editor-publish-actions">
      <button type="button" class="pf-editor-publish-btn" [disabled]="state.isSaving()" (click)="publish()">
        <lucide-icon [img]="rocketIcon" class="h-4 w-4" />
        {{ draft()?.published ? 'Update published store' : 'Publish store' }}
      </button>
      @if (state.lastSavedAt()) {
        <p class="pf-editor-hint">Last saved {{ state.lastSavedAt() | date: 'short' }}</p>
      }
    </div>
  `,
  styles: `
    .pf-editor-publish-actions {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.75rem;
      background: rgb(248 250 252);
    }
  `
})
export class PublishEditorPanelComponent {
  readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Rocket;
  readonly rocketIcon = Rocket;
  readonly externalIcon = ExternalLink;
  readonly storeUrlIcon = Link;
  readonly ctaLabelIcon = MousePointerClick;
  readonly ctaTypeIcon = Tag;
  readonly ctaTargetIcon = Target;
  readonly statusIcon = CircleDot;
  readonly normalizeSlug = normalizeSlug;

  readonly buffer = computed(() => this.sectionState.buffer<PublishSectionBuffer>('publish'));

  patch(partial: Partial<PublishSectionBuffer>): void {
    this.sectionState.patchBuffer<PublishSectionBuffer>('publish', (b) => ({ ...b, ...partial }));
  }

  patchCta(partial: Partial<PublishSectionBuffer['cta']>): void {
    this.sectionState.patchBuffer<PublishSectionBuffer>('publish', (b) => ({
      ...b,
      cta: { ...b.cta, ...partial }
    }));
  }

  publish(): void {
    if (this.sectionState.isEditing('publish')) {
      this.sectionState.saveSection('publish');
      return;
    }
    this.state.publish();
  }
}
