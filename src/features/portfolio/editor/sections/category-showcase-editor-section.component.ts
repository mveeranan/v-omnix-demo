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

      <!-- View mode -->
      <div view class="admin-detail-view admin-detail-view--rich">
        <app-admin-detail-card>
          <app-admin-detail-item
            label="Selected categories"
            [value]="draftSelectedCount() + ' of 4 selected' + (draftSelectedCount() === 0 ? ' (auto if none)' : '')"
          />
        </app-admin-detail-card>
      </div>

      <!-- Edit mode -->
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show category showcase"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />

          <!-- Dropdown selector (Max 4) -->
          <div class="pf-editor-field">
            <label class="pf-editor-label">
              Select categories (max 4)
              <span class="ml-1 text-[var(--text-muted)]">({{ selectedCount() }}/4)</span>
            </label>
            <select
              class="pf-editor-input"
              (change)="addCategory($any($event.target).value); $any($event.target).value = ''"
              [disabled]="selectedCount() >= 4"
            >
              <option value="">+ Add category...</option>
              @for (cat of availableCategories(b); track cat.id) {
                <option [value]="cat.name">{{ cat.name }}</option>
              }
            </select>
            <p class="pf-editor-hint mt-2">Select up to 4 categories to feature. Leave empty to show top categories automatically.</p>
          </div>

          <!-- Selected categories preview -->
          @if (selectedCount() > 0) {
            <div class="pf-category-preview">
              <p class="pf-editor-label mb-3">Selected Categories</p>
              <div class="pf-preview-grid">
                @for (name of b.categoryNames; track name; let idx = $index) {
                  <div class="pf-preview-card">
                    @if (getCategoryImage(name); as img) {
                      <img [src]="img" [alt]="name" class="pf-preview-card__image" />
                    } @else {
                      <div class="pf-preview-card__image pf-preview-card__image--empty"></div>
                    }
                    <div class="pf-preview-card__info">
                      <p class="pf-preview-card__name">{{ name }}</p>
                      <button
                        type="button"
                        (click)="removeCategory(name)"
                        class="pf-preview-card__remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

    </app-website-section-shell>
  `,
  styles: `
    .pf-category-preview {
      margin-top: 1.5rem;
      padding: 1rem;
      background: color-mix(in srgb, var(--border-subtle, #e5e7eb) 50%, transparent);
      border-radius: 0.5rem;
    }
    .pf-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
    }
    .pf-preview-card {
      border: 1px solid var(--border-subtle);
      border-radius: 0.5rem;
      overflow: hidden;
      background: white;
    }
    .pf-preview-card__image {
      width: 100%;
      height: 100px;
      object-fit: contain;
      background: white;
      display: block;
    }
    .pf-preview-card__image--empty {
      width: 100%;
      height: 100px;
      background: var(--border-subtle);
    }
    .pf-preview-card__info {
      padding: 0.75rem;
    }
    .pf-preview-card__name {
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0 0 0.5rem;
    }
    .pf-preview-card__remove {
      width: 100%;
      padding: 0.4rem;
      font-size: 0.75rem;
      background: #fee2e2;
      color: #991b1b;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .pf-preview-card__remove:hover {
      background: #fecaca;
    }
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

  // New methods for dropdown selector
  availableCategories(b: PortfolioCategoryShowcase) {
    return this.allCategories().filter(cat => !b.categoryNames.includes(cat.name));
  }

  addCategory(name: string): void {
    if (!name) return;
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => {
      if (b.categoryNames.length >= 4) return b;
      return { ...b, categoryNames: [...b.categoryNames, name] };
    });
  }

  removeCategory(name: string): void {
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => {
      return { ...b, categoryNames: b.categoryNames.filter(n => n !== name) };
    });
  }

  getCategoryImage(name: string): string | null {
    const cat = this.allCategories().find(c => c.name === name);
    return cat?.imageDocumentUrl || null;
  }
}
