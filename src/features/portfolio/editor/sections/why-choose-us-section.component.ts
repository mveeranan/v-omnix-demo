import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Award, List, Plus, Trash2, Type } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioHighlightItem, PortfolioHighlights } from '../../models/portfolio.model';
import {
  HIGHLIGHT_ICON_OPTIONS,
  HIGHLIGHT_ICON_GROUPS,
  resolveHighlightIcon
} from '../../models/highlight-icons';

@Component({
  selector: 'app-why-choose-us-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent,
    AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="whyChooseUs" title="Why choose us" [icon]="icon" [complete]="(draft()?.highlights?.items?.length ?? 0) > 0">

      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="titleIcon" label="Section title" [value]="draft()?.highlights?.title" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="benefitsIcon" label="Benefits" [value]="(draft()?.highlights?.items?.length ?? 0) + ' items'" />
          </app-admin-detail-card>
        </div>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show section" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />

          <div class="pf-editor-field">
            <span class="pf-editor-label">Section title</span>
            <input class="pf-editor-input" [ngModel]="b.title" (ngModelChange)="patch({ title: $event })" />
          </div>

          @for (item of b.items; track $index; let i = $index) {
            <div class="pf-editor-item-card">
              <div class="pf-editor-item-card__actions">
                <button type="button" class="text-red-500" (click)="remove(i)" aria-label="Remove">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>

              <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Benefit {{ i + 1 }}</span>
                  <input class="pf-editor-input" [ngModel]="item.text" (ngModelChange)="updateItem(i, { text: $event })" />
                </div>

                <div class="pf-editor-field">
                  <span class="pf-editor-label">Icon</span>
                  <div class="flex items-center gap-2">
                    <!-- Live icon preview -->
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]">
                      <lucide-icon [img]="getIcon(item.iconId)" [size]="16" class="text-[var(--accent)]" />
                    </span>
                    <!-- Grouped select -->
                    <select class="pf-editor-input flex-1" [ngModel]="item.iconId" (ngModelChange)="updateItem(i, { iconId: $event })">
                      @for (group of iconGroups; track group) {
                        <optgroup [label]="group">
                          @for (opt of iconsInGroup(group); track opt.id) {
                            <option [value]="opt.id">{{ opt.label }}</option>
                          }
                        </optgroup>
                      }
                    </select>
                  </div>
                </div>
              </div>
            </div>
          }

          <button type="button" class="pf-editor-add-btn" (click)="add()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add benefit
          </button>
        }
      </div>

    </app-website-section-shell>
  `
})
export class WhyChooseUsSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Award;
  readonly titleIcon = Type;
  readonly benefitsIcon = List;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;

  readonly iconGroups = HIGHLIGHT_ICON_GROUPS;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioHighlights>('whyChooseUs'));

  iconsInGroup(group: string) {
    return HIGHLIGHT_ICON_OPTIONS.filter((o) => o.group === group);
  }

  getIcon(iconId: string) {
    return resolveHighlightIcon(iconId);
  }

  patch(partial: Partial<PortfolioHighlights>): void {
    this.sectionState.patchBuffer<PortfolioHighlights>('whyChooseUs', (b) => ({ ...b, ...partial }));
  }

  add(): void {
    const item: PortfolioHighlightItem = { text: '', iconId: 'sparkles' };
    this.sectionState.patchBuffer<PortfolioHighlights>('whyChooseUs', (b) => ({ ...b, items: [...b.items, item] }));
  }

  updateItem(index: number, partial: Partial<PortfolioHighlightItem>): void {
    this.sectionState.patchBuffer<PortfolioHighlights>('whyChooseUs', (b) => ({
      ...b,
      items: b.items.map((item, i) => (i === index ? { ...item, ...partial } : item))
    }));
  }

  remove(index: number): void {
    this.sectionState.patchBuffer<PortfolioHighlights>('whyChooseUs', (b) => ({
      ...b,
      items: b.items.filter((_, i) => i !== index)
    }));
  }
}
