import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Grid3x3 } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioCategoryShowcase } from '../../models/portfolio.model';
import { productCatalogStore } from '../../../store/data-access/product-catalog.store';

@Component({
  selector: 'app-category-showcase-editor-section',
  standalone: true,
  imports: [CommonModule, FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell sectionId="categoryShowcase" title="Shop by category" [icon]="icon" [complete]="true">
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Title" [value]="buffer()?.title" />
        <app-admin-detail-field label="Categories" [value]="(buffer()?.categoryNames?.length ?? 0) + ' selected (auto if none)'" />
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show category showcase" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Title</span>
            <input class="pf-editor-input" [ngModel]="b.title" (ngModelChange)="patch({ title: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Subtitle</span>
            <input class="pf-editor-input" [ngModel]="b.subtitle" (ngModelChange)="patch({ subtitle: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Max categories</span>
            <input type="number" min="2" max="8" class="pf-editor-input" [ngModel]="b.maxCount" (ngModelChange)="patch({ maxCount: +$event })" />
          </div>
          <p class="pf-editor-hint">Select categories to feature. Leave empty to show top catalog categories.</p>
          <div class="pf-product-pin-list">
            @for (name of catalogCategories(); track name) {
              <label class="pf-product-pin-item">
                <input type="checkbox" [checked]="isSelected(name)" (change)="toggleCategory(name, $any($event.target).checked)" />
                <span class="pf-product-pin-item__name">{{ name }}</span>
              </label>
            }
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-product-pin-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .pf-product-pin-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--border-subtle); cursor: pointer; }
    .pf-product-pin-item__name { flex: 1; font-size: 0.875rem; }
  `
})
export class CategoryShowcaseEditorSectionComponent implements OnInit {
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly icon = Grid3x3;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioCategoryShowcase>('categoryShowcase'));
  readonly catalogCategories = signal<string[]>([]);

  ngOnInit(): void {
    const names = [
      ...new Set(productCatalogStore.getAll().filter((p) => p.status === 'active').map((p) => p.category))
    ].sort();
    this.catalogCategories.set(names);
  }

  patch(partial: Partial<PortfolioCategoryShowcase>): void {
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => ({ ...b, ...partial }));
  }

  isSelected(name: string): boolean {
    return this.buffer()?.categoryNames.includes(name) ?? false;
  }

  toggleCategory(name: string, checked: boolean): void {
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => {
      const names = new Set(b.categoryNames);
      if (checked) names.add(name);
      else names.delete(name);
      return { ...b, categoryNames: [...names] };
    });
  }
}
