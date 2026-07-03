import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Grid3x3 } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { PortfolioCategoryShowcase } from '../../models/portfolio.model';
import { CategoryAdminService } from '@features/admin/data-access/category-admin.service';
import { ProductCategoryDto } from '@features/catalog/models/product-category.model';

@Component({
  selector: 'app-category-showcase-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent,
    AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="categoryShowcase" title="Shop by category" [icon]="icon" [complete]="true">

      <!-- View mode — uses draft (not buffer) so counts are correct when not editing -->
      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item label="Display limit" [value]="(draftShowcase()?.maxCount ?? 4).toString()" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item
              label="Selected categories"
              [value]="draftSelectedCount() + ' of ' + (draftShowcase()?.maxCount ?? 4) + (draftSelectedCount() === 0 ? ' (auto if none)' : ' selected')"
            />
          </app-admin-detail-card>
        </div>
      </div>

      <!-- Edit mode -->
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show category showcase"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />

          <!-- Display limit -->
          <div class="pf-editor-field">
            <span class="pf-editor-label">Display limit (how many categories to show)</span>
            <input
              type="number" min="1" max="8" class="pf-editor-input w-28"
              [ngModel]="b.maxCount"
              (ngModelChange)="onLimitChange(+$event, b)"
            />
          </div>

          <!-- Category selection (restricted to limit) -->
          <div class="space-y-1">
            <p class="pf-editor-label">
              Choose categories to feature
              <span class="ml-1 text-[var(--text-muted)]">({{ selectedCount() }}/{{ b.maxCount }} selected)</span>
            </p>
            <p class="pf-editor-hint">Leave all unselected to automatically show the top active categories.</p>

            @if (loading()) {
              <p class="text-xs text-[var(--text-muted)]">Loading categories…</p>
            } @else if (!allCategories().length) {
              <p class="text-xs text-[var(--text-muted)]">No categories found. Create categories first.</p>
            } @else {
              <div class="pf-cat-pin-list">
                @for (cat of allCategories(); track cat.id) {
                  <label
                    class="pf-cat-pin-item"
                    [class.pf-cat-pin-item--disabled]="!isSelected(cat.name, b) && selectedCount() >= b.maxCount"
                  >
                    <input
                      type="checkbox"
                      [checked]="isSelected(cat.name, b)"
                      [disabled]="!isSelected(cat.name, b) && selectedCount() >= b.maxCount"
                      (change)="toggleCategory(cat.name, $any($event.target).checked)"
                    />
                    @if (cat.imageDocumentUrl) {
                      <img [src]="cat.imageDocumentUrl" [alt]="cat.name" class="h-8 w-8 rounded object-cover" />
                    }
                    <span class="pf-cat-pin-item__name">{{ cat.name }}</span>
                  </label>
                }
              </div>
            }
          </div>
        }
      </div>

    </app-website-section-shell>
  `,
  styles: `
    .pf-cat-pin-list { display: flex; flex-direction: column; gap: 0.375rem; }
    .pf-cat-pin-item {
      display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.625rem;
      border-radius: 0.5rem; border: 1px solid var(--border-subtle); cursor: pointer;
    }
    .pf-cat-pin-item--disabled { opacity: 0.4; cursor: not-allowed; }
    .pf-cat-pin-item__name { flex: 1; font-size: 0.875rem; }
  `
})
export class CategoryShowcaseEditorSectionComponent implements OnInit {
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly portfolioState = inject(PortfolioStateService);
  private readonly categoryApi = inject(CategoryAdminService);

  readonly icon = Grid3x3;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioCategoryShowcase>('categoryShowcase'));
  readonly allCategories = signal<ProductCategoryDto[]>([]);
  readonly loading = signal(true);

  // Used in edit template (buffer is populated while editing)
  readonly selectedCount = computed(() => this.buffer()?.categoryNames?.length ?? 0);
  // Used in view template (buffer is null when not editing — use draft directly)
  readonly draftShowcase = computed(() => this.portfolioState.draft()?.categoryShowcase);
  readonly draftSelectedCount = computed(() => this.draftShowcase()?.categoryNames?.length ?? 0);

  ngOnInit(): void {
    this.categoryApi.listFlat().subscribe({
      next: (cats) => {
        this.allCategories.set(cats.filter((c) => c.isActive).sort((a, b) => a.name.localeCompare(b.name)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  patch(partial: Partial<PortfolioCategoryShowcase>): void {
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => ({ ...b, ...partial }));
  }

  onLimitChange(newLimit: number, b: PortfolioCategoryShowcase): void {
    const clamped = Math.max(1, Math.min(8, newLimit));
    // Trim selected categories if they exceed the new limit
    const trimmedNames = b.categoryNames.slice(0, clamped);
    this.patch({ maxCount: clamped, categoryNames: trimmedNames });
  }

  isSelected(name: string, b: PortfolioCategoryShowcase): boolean {
    return b.categoryNames.includes(name);
  }

  toggleCategory(name: string, checked: boolean): void {
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => {
      const names = new Set(b.categoryNames);
      if (checked && names.size < b.maxCount) names.add(name);
      else if (!checked) names.delete(name);
      return { ...b, categoryNames: [...names] };
    });
  }
}
