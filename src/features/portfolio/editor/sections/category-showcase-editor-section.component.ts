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
import { NotificationService } from '@core/notifications/notification.service';
import { LAYOUT_STYLES } from '@features/store/section-layout/layout-styles.registry';

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
            label="Heading"
            [value]="draftShowcase()?.displayName || draftShowcase()?.title || 'Shop by category'"
          />
          <app-admin-detail-item
            label="Layout style"
            [value]="layoutLabel(draftShowcase()?.layoutStyle)"
          />
          <app-admin-detail-item
            label="Selected categories"
            [value]="draftSelectedCount() + ' selected' + (draftSelectedCount() === 0 ? ' (auto if none)' : '')"
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

          <!-- Display name -->
          <div class="pf-editor-field">
            <label class="pf-editor-label" for="cat-display-name">Section heading</label>
            <input
              id="cat-display-name"
              type="text"
              class="pf-editor-input"
              [ngModel]="b.displayName ?? ''"
              (ngModelChange)="patch({ displayName: $event })"
              placeholder="e.g. Shop by Category"
            />
            <p class="pf-editor-hint mt-2">The heading shown above this section on your website.</p>
          </div>

          <!-- Layout style picker -->
          <div class="pf-editor-field">
            <label class="pf-editor-label">Layout style</label>
            <div class="pf-layout-picker">
              @for (style of layoutStyles; track style.id) {
                <button
                  type="button"
                  class="pf-layout-option"
                  [class.pf-layout-option--active]="activeLayout(b) === style.id"
                  (click)="patch({ layoutStyle: style.id })"
                >
                  <span class="pf-layout-option__name">{{ style.label }}</span>
                  @if (style.hint) {
                    <span class="pf-layout-option__hint">{{ style.hint }}</span>
                  }
                </button>
              }
            </div>
            <p class="pf-editor-hint mt-2">Changes only how categories are presented — your selected categories stay the same.</p>
          </div>

          <!-- Category selector -->
          <div class="pf-editor-field">
            <label class="pf-editor-label">
              Select categories
              <span class="ml-1 text-[var(--text-muted)]">({{ selectedCount() }} selected)</span>
            </label>
            <select
              class="pf-editor-input"
              (change)="addCategory($any($event.target).value); $any($event.target).value = ''"
              [disabled]="availableCategories(b).length === 0"
            >
              <option value="">+ Add category...</option>
              @for (cat of availableCategories(b); track cat.id) {
                <option [value]="cat.name">{{ cat.name }}</option>
              }
            </select>
            <p class="pf-editor-hint mt-2">Add as many categories as you like. Leave empty to show top categories automatically.</p>
          </div>

          <!-- Items to display -->
          <div class="pf-editor-field">
            <label class="pf-editor-label" for="cat-item-limit">Categories to display on website</label>
            <input
              id="cat-item-limit"
              type="number"
              min="1"
              class="pf-editor-input pf-editor-input--narrow"
              [ngModel]="b.itemLimit ?? selectedCount() ?? b.maxCount"
              (ngModelChange)="onItemLimitChange($event)"
            />
            <p class="pf-editor-hint mt-2">
              How many of your selected categories to show. You've selected {{ selectedCount() }}.
            </p>
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
    .pf-editor-input--narrow { max-width: 8rem; }

    .pf-layout-picker {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    .pf-layout-option {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0.9rem;
      text-align: left;
      background: var(--surface, #fff);
      border: 1px solid var(--border-subtle, #e5e7eb);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .pf-layout-option:hover {
      border-color: color-mix(in srgb, var(--primary, #ff6f00) 50%, var(--border-subtle, #e5e7eb));
    }
    .pf-layout-option--active {
      border-color: var(--primary, #ff6f00);
      box-shadow: 0 0 0 1px var(--primary, #ff6f00) inset;
      background: color-mix(in srgb, var(--primary, #ff6f00) 6%, transparent);
    }
    .pf-layout-option__name { font-size: 0.875rem; font-weight: 600; color: var(--text, #111827); }
    .pf-layout-option__hint { font-size: 0.72rem; color: var(--text-muted, #6b7280); line-height: 1.3; }

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
  private readonly notifications = inject(NotificationService);

  readonly icon = Grid3x3;
  readonly layoutStyles = LAYOUT_STYLES['categoryShowcase'] ?? [];
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
      error: (err) => {
        this.notifications.errorFromApi(err, 'Could not load categories.');
        this.loading.set(false);
      }
    });
  }

  patch(partial: Partial<PortfolioCategoryShowcase>): void {
    this.sectionState.patchBuffer<PortfolioCategoryShowcase>('categoryShowcase', (b) => ({ ...b, ...partial }));
  }

  /** The effective layout style shown as selected in the picker. */
  activeLayout(b: PortfolioCategoryShowcase): string {
    return b.layoutStyle || 'image-grid';
  }

  /** Human label for a layout style id, for the read-only view. */
  layoutLabel(styleId: string | null | undefined): string {
    const id = styleId || 'image-grid';
    return this.layoutStyles.find((s) => s.id === id)?.label ?? 'Image Grid';
  }

  /** How many categories to display on the live site (does not trim the selection). */
  onItemLimitChange(value: number | string): void {
    const n = Math.max(1, Math.floor(Number(value) || 1));
    this.patch({ itemLimit: n });
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
      if (b.categoryNames.includes(name)) return b;
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
