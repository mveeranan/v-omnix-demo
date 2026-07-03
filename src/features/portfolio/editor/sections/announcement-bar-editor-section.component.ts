import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Megaphone } from 'lucide-angular';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioAnnouncementBar } from '../../models/portfolio.model';

@Component({
  selector: 'app-announcement-bar-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent],
  template: `
    <app-website-section-shell
      sectionId="announcementBar"
      title="Announcement Bar"
      [icon]="icon"
      [complete]="!!draft()?.announcementBar?.text"
    >
      <div view class="pf-editor-view-summary">
        @if (draft()?.announcementBar?.text) {
          <p class="pf-editor-view-text truncate">{{ draft()?.announcementBar?.text }}</p>
        } @else {
          <p class="pf-editor-view-empty">No announcement set</p>
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show announcement bar"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Announcement text</span>
            <input
              class="pf-editor-input"
              [ngModel]="b.text"
              (ngModelChange)="patch({ text: $event })"
              placeholder="🎉 Free shipping on orders over $50 — Limited time offer!"
            />
          </div>
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Link label</span>
              <input
                class="pf-editor-input"
                [ngModel]="b.linkLabel"
                (ngModelChange)="patch({ linkLabel: $event })"
                placeholder="Shop Now"
              />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Link URL</span>
              <input
                class="pf-editor-input"
                [ngModel]="b.linkUrl"
                (ngModelChange)="patch({ linkUrl: $event })"
                placeholder="/store/slug/products"
              />
            </div>
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class AnnouncementBarEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Megaphone;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioAnnouncementBar>('announcementBar'));

  patch(partial: Partial<PortfolioAnnouncementBar>): void {
    this.sectionState.patchBuffer<PortfolioAnnouncementBar>('announcementBar', (b) => ({ ...b, ...partial }));
  }
}
