import { afterNextRender, Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Layers } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { NotificationService } from '@core/notifications/notification.service';
import { SaveProductVariantItem } from '@features/catalog/models/product-admin.model';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';
import {
  addVariantRow,
  attributeIdsFromRows,
  removeVariantRow,
  variantLabel,
  variantRowsFromProduct,
  VariantRow
} from './product-variant.util';

@Component({
  selector: 'app-product-variants-section',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminFormSectionCardComponent],
  template: `
    <app-admin-form-section-card
      title="Variants"
      [icon]="sectionIcon"
      [disabled]="!state.sectionsEnabled()"
      [complete]="isComplete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="state.isSectionSaving('variants')"
      [canSave]="!!state.productId()"
      [lastSavedAt]="state.sectionLastSaved('variants')"
      (edit)="startEdit()"
      (save)="save()"
      (cancel)="cancelEdit()"
    >
      @if (!editing() && state.product()) {
        @if (!state.product()!.variants.length) {
          <p class="text-sm text-[var(--text-muted)]">Simple product — no variants.</p>
        } @else {
          <ul class="space-y-2 text-sm">
            @for (v of state.product()!.variants; track v.id) {
              <li class="rounded-lg border border-[var(--border)] px-3 py-2">
                <span class="font-medium">{{ productName() }}</span>
                <span class="text-[var(--text-muted)]"> — {{ variantAttrs(v) }}</span>
              </li>
            }
          </ul>
        }
      } @else {
        <div class="space-y-4">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" [checked]="hasVariants()" (change)="onVariantsToggle($event)" />
            This product has variants
          </label>
          @if (hasVariants()) {
            @if (!state.attributes().length) {
              <p class="text-sm text-[var(--text-muted)]">
                Define attributes first.
                <a routerLink="/admin/product-attributes" class="underline">Manage attributes</a>
              </p>
            } @else {
              <div class="space-y-3 rounded-lg border border-[var(--border)] p-3">
                <p class="text-sm font-medium">New variant</p>
                <div class="flex flex-wrap items-end gap-3">
                  <label class="block min-w-[10rem] flex-1 space-y-1">
                    <span class="text-sm font-medium">Feature type</span>
                    <select
                      class="pf-editor-input w-full"
                      [(ngModel)]="featureTypeId"
                      (ngModelChange)="featureValueId = ''"
                    >
                      <option value="">Select feature type</option>
                      @for (attr of state.attributes(); track attr.id) {
                        <option [value]="attr.id">{{ attr.name }}</option>
                      }
                    </select>
                  </label>
                  <label class="block min-w-[10rem] flex-1 space-y-1">
                    <span class="text-sm font-medium">Value</span>
                    <select class="pf-editor-input w-full" [(ngModel)]="featureValueId" [disabled]="!featureTypeId">
                      <option value="">Select value</option>
                      @for (val of valuesForFeatureType(); track val.id) {
                        <option [value]="val.id">{{ val.value }}</option>
                      }
                    </select>
                  </label>
                  <button
                    type="button"
                    class="admin-action-secondary rounded-lg px-3 py-1.5 text-sm"
                    [disabled]="!featureTypeId || !featureValueId"
                    (click)="addDraftFeature()"
                  >
                    Add feature
                  </button>
                </div>
                @if (draftFeatureChips().length) {
                  <div class="flex flex-wrap gap-2">
                    @for (chip of draftFeatureChips(); track chip.attributeId) {
                      <span class="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-sm">
                        {{ chip.label }}
                        <button
                          type="button"
                          class="text-[var(--text-muted)] hover:text-rose-600"
                          (click)="removeDraftFeature(chip.attributeId)"
                          aria-label="Remove feature"
                        >
                          ×
                        </button>
                      </span>
                    }
                  </div>
                }
                <button
                  type="button"
                  class="admin-section-action-btn rounded-lg px-3 py-1.5 text-sm"
                  [disabled]="!hasDraftSelections()"
                  (click)="addVariant()"
                >
                  Add variant
                </button>
              </div>
              @if (variantRows().length) {
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead>
                      <tr class="border-b">
                        <th class="p-2">Attributes</th>
                        <th class="p-2">Price</th>
                        <th class="p-2">Active</th>
                        <th class="p-2">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of variantRows(); track $index) {
                        <tr class="border-b">
                          <td class="p-2 text-xs">{{ rowLabel(row) }}</td>
                          <td class="p-2">
                            <input class="pf-editor-input w-20 text-xs" type="number" [(ngModel)]="row.price" />
                          </td>
                          <td class="p-2">
                            <input type="checkbox" [(ngModel)]="row.isActive" />
                          </td>
                          <td class="p-2">
                            <button type="button" class="text-xs text-rose-600" (click)="removeVariant($index)">
                              Remove
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            }
          }
        </div>
      }
    </app-admin-form-section-card>
  `
})
export class ProductVariantsSectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly notifications = inject(NotificationService);
  private readonly injector = inject(Injector);

  readonly sectionIcon = Layers;
  readonly expanded = signal(false);
  readonly editing = signal(false);
  readonly hasVariants = signal(false);
  readonly variantRows = signal<VariantRow[]>([]);
  readonly draftSelections = signal<Record<string, string>>({});
  readonly productName = computed(() => this.state.product()?.name ?? 'Product');

  featureTypeId = '';
  featureValueId = '';

  constructor() {
    effect(() => {
      const p = this.state.product();
      this.state.attributes();
      if (p && !this.editing()) {
        this.patchFromProduct();
      }
    });
  }

  valuesForFeatureType() {
    const attr = this.state.attributes().find((a) => a.id === this.featureTypeId);
    return attr?.values ?? [];
  }

  draftFeatureChips(): { attributeId: string; label: string }[] {
    return Object.entries(this.draftSelections()).map(([attributeId, valueId]) => {
      const attr = this.state.attributes().find((a) => a.id === attributeId);
      const val = attr?.values.find((v) => v.id === valueId);
      return {
        attributeId,
        label: val ? `${attr?.name}: ${val.value}` : attributeId
      };
    });
  }

  isComplete(): boolean {
    return (this.state.product()?.variants.length ?? 0) > 0;
  }

  startEdit(): void {
    this.editing.set(true);
    afterNextRender(
      () => this.patchFromProduct(),
      { injector: this.injector }
    );
  }

  cancelEdit(): void {
    this.patchFromProduct();
    this.resetDraftInputs();
    this.editing.set(false);
  }

  onVariantsToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.hasVariants.set(checked);
    if (!checked) {
      this.variantRows.set([]);
      this.draftSelections.set({});
      this.resetDraftInputs();
    }
  }

  addDraftFeature(): void {
    if (!this.featureTypeId || !this.featureValueId) return;
    this.draftSelections.update((current) => ({
      ...current,
      [this.featureTypeId]: this.featureValueId
    }));
    this.featureTypeId = '';
    this.featureValueId = '';
  }

  removeDraftFeature(attributeId: string): void {
    this.draftSelections.update((current) => {
      const next = { ...current };
      delete next[attributeId];
      return next;
    });
  }

  hasDraftSelections(): boolean {
    return Object.keys(this.draftSelections()).length > 0;
  }

  addVariant(): void {
    if (!this.hasDraftSelections()) return;
    const p = this.state.product();
    const defaults = {
      price: p?.price ?? 0,
      compareAtPrice: p?.compareAtPrice ?? null,
      weight: p?.weight ?? null
    };
    const before = this.variantRows().length;
    const next = addVariantRow(this.variantRows(), this.draftSelections(), defaults);
    if (next.length === before) {
      this.notifications.error('This variant combination already exists');
      return;
    }
    this.variantRows.set(next);
    this.draftSelections.set({});
    this.resetDraftInputs();
  }

  removeVariant(index: number): void {
    this.variantRows.set(removeVariantRow(this.variantRows(), index));
  }

  rowLabel(row: VariantRow): string {
    return variantLabel(row, this.state.attributes());
  }

  variantAttrs(v: { attributes: { attributeName: string; value: string }[] }): string {
    return v.attributes.map((a) => `${a.attributeName}: ${a.value}`).join(', ');
  }

  save(): void {
    const productId = this.state.productId();
    if (!productId) return;

    const variants: SaveProductVariantItem[] = this.hasVariants()
      ? this.variantRows().map((row) => ({
          id: row.id,
          price: row.price,
          compareAtPrice: row.compareAtPrice,
          barcode: row.barcode || null,
          weight: row.weight,
          isActive: row.isActive,
          attributes: Object.entries(row.attributeSelections).map(([attributeId, valueId]) => ({
            attributeId,
            valueId
          }))
        }))
      : [];

    this.state.setSectionSaving('variants', true);
    this.api.saveVariants(productId, [...attributeIdsFromRows(this.variantRows())], variants).subscribe({
      next: (saved) => {
        this.state.setSectionSaving('variants', false);
        this.state.markSectionSaved('variants');
        if (saved) {
          this.state.mergeProduct(saved);
          this.patchFromProduct();
        }
        this.editing.set(false);
        this.notifications.success('Variants saved');
      },
      error: (err) => {
        this.state.setSectionSaving('variants', false);
        this.notifications.error(err?.message ?? 'Could not save variants');
      }
    });
  }

  private patchFromProduct(): void {
    const p = this.state.product();
    if (!p) return;
    this.hasVariants.set(p.variants.length > 0);
    this.variantRows.set(variantRowsFromProduct(p));
    this.draftSelections.set({});
    this.resetDraftInputs();
  }

  private resetDraftInputs(): void {
    this.featureTypeId = '';
    this.featureValueId = '';
  }
}
