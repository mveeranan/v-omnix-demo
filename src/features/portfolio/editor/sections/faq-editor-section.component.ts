import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HelpCircle, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioFaq, PortfolioFaqItem } from '../../models/portfolio.model';

@Component({
  selector: 'app-faq-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent],
  template: `
    <app-website-section-shell
      sectionId="faq"
      title="FAQ"
      [icon]="icon"
      [complete]="(draft()?.faq?.items?.length ?? 0) > 0"
    >
      <div view class="pf-editor-view-summary">
        <p class="pf-editor-view-text">{{ draft()?.faq?.items?.length ?? 0 }} question(s) — {{ draft()?.faq?.title }}</p>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show FAQ section"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Section title</span>
            <input
              class="pf-editor-input"
              [ngModel]="b.title"
              (ngModelChange)="patch({ title: $event })"
              placeholder="Frequently Asked Questions"
            />
          </div>

          <div class="pf-editor-faq-list">
            @for (item of b.items; track item.id; let i = $index) {
              <div class="pf-editor-faq-item">
                <div class="pf-editor-faq-item__header">
                  <span class="pf-editor-label">Q{{ i + 1 }}</span>
                  <button type="button" class="pf-editor-icon-btn pf-editor-icon-btn--danger" (click)="removeItem(b, i)">
                    <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                  </button>
                </div>
                <div class="pf-editor-field">
                  <input
                    class="pf-editor-input"
                    [ngModel]="item.question"
                    (ngModelChange)="patchItem(b, i, { question: $event })"
                    placeholder="What is your return policy?"
                  />
                </div>
                <div class="pf-editor-field">
                  <textarea
                    class="pf-editor-input pf-editor-textarea"
                    [ngModel]="item.answer"
                    (ngModelChange)="patchItem(b, i, { answer: $event })"
                    rows="2"
                    placeholder="We accept returns within 30 days..."
                  ></textarea>
                </div>
              </div>
            }
          </div>

          <button type="button" class="pf-editor-add-btn" (click)="addItem(b)">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" />
            Add question
          </button>
        }
      </div>
    </app-website-section-shell>
  `
})
export class FaqEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = HelpCircle;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioFaq>('faq'));

  patch(partial: Partial<PortfolioFaq>): void {
    this.sectionState.patchBuffer<PortfolioFaq>('faq', (b) => ({ ...b, ...partial }));
  }

  patchItem(b: PortfolioFaq, index: number, partial: Partial<PortfolioFaqItem>): void {
    const items = b.items.map((item, i) => i === index ? { ...item, ...partial } : item);
    this.patch({ items });
  }

  addItem(b: PortfolioFaq): void {
    const newItem: PortfolioFaqItem = {
      id: crypto.randomUUID(),
      question: '',
      answer: '',
      order: b.items.length
    };
    this.patch({ items: [...b.items, newItem] });
  }

  removeItem(b: PortfolioFaq, index: number): void {
    this.patch({ items: b.items.filter((_, i) => i !== index) });
  }
}
