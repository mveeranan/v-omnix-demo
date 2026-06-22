import { afterNextRender, Component, effect, inject, Injector, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Layers } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { NotificationService } from '@core/notifications/notification.service';
import { SaveProductVariantItem } from '@features/catalog/models/product-admin.model';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';
import {
  generateVariantRows,
  selectedAttributeIdsFromProduct,
  variantLabel,
  variantRowsFromProduct,
  VariantRow
} from './product-variant.util';

@Component({
  selector: 'app-product-variants-section',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminFormSectionCardComponent],
  template: `
    @if (!state.sectionsEnabled()) {
      <div class="pf-editor-card rounded-xl p-4">
        <p class="text-sm font-semibold">Variants</p>
        <p class="mt-1 text-sm text-[var(--text-muted)]">Save product details first to enable this section.</p>
      </div>
    } @else {
      <app-admin-form-section-card
        title="Variants"
        subtitle="Options, SKUs, and variant pricing"
        [icon]="sectionIcon"
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
                  <span class="font-medium">{{ v.sku }}</span>
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
                <div class="space-y-3">
                  <p class="text-sm font-medium">Select attributes for variants</p>
                  @for (attr of state.attributes(); track attr.id) {
                    <label class="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        [checked]="selectedAttributeIds().has(attr.id)"
                        (change)="toggleAttribute(attr.id)"
                      />
                      {{ attr.name }} ({{ attr.values.length }} values)
                    </label>
                  }
                  <button
                    type="button"
                    class="admin-action-secondary rounded-lg px-3 py-1.5 text-sm"
                    (click)="generateVariants()"
                  >
                    Generate variant combinations
                  </button>
                </div>
                @if (variantRows().length) {
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                      <thead>
                        <tr class="border-b">
                          <th class="p-2">SKU</th>
                          <th class="p-2">Price</th>
                          <th class="p-2">Attributes</th>
                          <th class="p-2">Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (row of variantRows(); track $index) {
                          <tr class="border-b">
                            <td class="p-2 text-xs text-[var(--text-muted)]">
                              {{ row.sku || 'Assigned on save' }}
                            </td>
                            <td class="p-2">
                              <input class="pf-editor-input w-20 text-xs" type="number" [(ngModel)]="row.price" />
                            </td>
                            <td class="p-2 text-xs">{{ rowLabel(row) }}</td>
                            <td class="p-2">
                              <input type="checkbox" [(ngModel)]="row.isActive" />
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
    }
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
  readonly selectedAttributeIds = signal(new Set<string>());
  readonly variantRows = signal<VariantRow[]>([]);

  constructor() {
    effect(() => {
      const p = this.state.product();
      this.state.attributes();
      if (p && !this.editing()) {
        this.patchFromProduct();
      }
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
    this.editing.set(false);
  }

  onVariantsToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.hasVariants.set(checked);
    if (!checked) {
      this.variantRows.set([]);
      this.selectedAttributeIds.set(new Set());
    }
  }

  toggleAttribute(id: string): void {
    const next = new Set(this.selectedAttributeIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedAttributeIds.set(next);
  }

  generateVariants(): void {
    const p = this.state.product();
    const defaults = {
      price: p?.price ?? 0,
      compareAtPrice: p?.compareAtPrice ?? null,
      weight: p?.weight ?? null
    };
    this.variantRows.set(
      generateVariantRows(
        this.state.attributes(),
        this.selectedAttributeIds(),
        defaults,
        this.variantRows()
      )
    );
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
    this.api.saveVariants(productId, [...this.selectedAttributeIds()], variants).subscribe({
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
    this.selectedAttributeIds.set(selectedAttributeIdsFromProduct(p));
    this.variantRows.set(variantRowsFromProduct(p));
  }
}
