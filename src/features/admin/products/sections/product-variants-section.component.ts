import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Layers } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { NotificationService } from '@core/notifications/notification.service';
import { ProductVariantAttributeInput, ProductVariantDto } from '@features/catalog/models/product-admin.model';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';

@Component({
  selector: 'app-product-variants-section',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AdminFormSectionCardComponent,
    AppTableComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-form-section-card
      title="Variants"
      [icon]="sectionIcon"
      [disabled]="!state.sectionsEnabled()"
      [complete]="isComplete()"
      [(expanded)]="expanded"
      [editing]="false"
      [canSave]="false"
      (edit)="onSectionEdit()"
    >
      @if (!state.attributes().length && !(state.product()?.variants?.length ?? 0)) {
        <p class="text-sm text-[var(--text-muted)]">
          Define attributes first.
          <a routerLink="/admin/product-attributes" class="underline">Manage attributes</a>
        </p>
      } @else {
        @if (formOpen()) {
          <form class="admin-glass-card mb-4 space-y-4 rounded-xl p-4" [formGroup]="form" (ngSubmit)="saveForm()">
            <h4 class="text-sm font-semibold">{{ editingVariantId() ? 'Edit variant' : 'New variant' }}</h4>

            @if (editingVariantId() && editingSku()) {
              <label class="block space-y-1">
                <span class="text-sm font-medium">SKU</span>
                <input class="pf-editor-input w-full bg-[var(--surface-muted)]" [value]="editingSku()" readonly />
              </label>
            }

            <div class="space-y-3 rounded-lg border border-[var(--border)] p-3">
              <p class="text-sm font-medium">Attributes</p>
              @if (attributesAvailableForAdd().length) {
                <div class="flex flex-wrap items-end gap-3">
                  <label class="block min-w-[10rem] flex-1 space-y-1">
                    <span class="text-sm font-medium">Feature type</span>
                    <select
                      class="pf-editor-input w-full"
                      [(ngModel)]="featureTypeId"
                      [ngModelOptions]="{ standalone: true }"
                      (ngModelChange)="featureValueId = ''"
                    >
                      <option value="">Select feature type</option>
                      @for (attr of attributesAvailableForAdd(); track attr.id) {
                        <option [value]="attr.id">{{ attr.name }}</option>
                      }
                    </select>
                  </label>
                  <label class="block min-w-[10rem] flex-1 space-y-1">
                    <span class="text-sm font-medium">Value</span>
                    <select
                      class="pf-editor-input w-full"
                      [(ngModel)]="featureValueId"
                      [ngModelOptions]="{ standalone: true }"
                      [disabled]="!featureTypeId"
                    >
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
              }
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
              } @else {
                <p class="text-sm text-[var(--text-muted)]">No attributes selected.</p>
              }
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Price</span>
                <input class="pf-editor-input w-full" type="number" formControlName="price" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Compare at price</span>
                <input class="pf-editor-input w-full" type="number" formControlName="compareAtPrice" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Barcode</span>
                <input class="pf-editor-input w-full" formControlName="barcode" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Weight</span>
                <input class="pf-editor-input w-full" type="number" formControlName="weight" />
              </label>
            </div>

            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" formControlName="isActive" /> Active
            </label>

            <div class="flex justify-end gap-2">
              <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">
                Cancel
              </button>
              <button
                type="submit"
                class="admin-section-action-btn rounded-lg px-4 py-2 text-sm"
                [disabled]="form.invalid || saving() || !hasDraftSelections()"
              >
                {{ saving() ? 'Saving…' : editingVariantId() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        } @else {
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-[var(--text-muted)]">
              @if (hasVariants()) {
                Manage variants individually. Delete all variants to convert to a simple product.
              } @else {
                Simple product — no variants.
              }
            </p>
            @if (state.attributes().length) {
              <button
                type="button"
                class="admin-section-action-btn rounded-lg px-4 py-2 text-sm"
                [disabled]="saving()"
                (click)="openCreate()"
              >
                + Add variant
              </button>
            }
          </div>

          @if (!variants().length) {
            <p class="text-sm text-[var(--text-muted)]">No variants yet.</p>
          } @else {
            <app-table>
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th class="admin-data-table__index">#</th>
                    <th>SKU</th>
                    <th>Attributes</th>
                    <th>Price</th>
                    <th class="admin-data-table__col-status">Status</th>
                    <th class="admin-data-table__col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (v of variants(); track v.id; let i = $index) {
                    <tr class="admin-data-table__row">
                      <td class="admin-data-table__index">{{ i + 1 }}</td>
                      <td class="text-sm text-[var(--text-secondary)]">{{ v.sku }}</td>
                      <td class="text-sm">{{ variantAttrs(v) }}</td>
                      <td class="admin-data-table__price">{{ v.price }}</td>
                      <td class="admin-data-table__col-status">
                        <app-admin-status-badge
                          [label]="v.isActive ? 'Active' : 'Inactive'"
                          [variant]="v.isActive ? 'active' : 'inactive'"
                        />
                      </td>
                      <td class="admin-data-table__col-actions">
                        <div class="admin-data-table__actions">
                          <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(v)" />
                          <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(v)" />
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </app-table>
          }
        }
      }
    </app-admin-form-section-card>

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete variant"
      [message]="'Delete variant ' + (deleteTarget()?.sku ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class ProductVariantsSectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly sectionIcon = Layers;
  readonly expanded = signal(false);
  readonly sectionActive = signal(false);
  readonly saving = signal(false);
  readonly formOpen = signal(false);
  readonly editingVariantId = signal<string | null>(null);
  readonly editingSku = signal('');
  readonly deleteTarget = signal<ProductVariantDto | null>(null);
  readonly draftSelections = signal<Record<string, string>>({});

  readonly variants = computed(() => this.state.product()?.variants ?? []);
  readonly hasVariants = computed(() => this.variants().length > 0);
  readonly productName = computed(() => this.state.product()?.name ?? 'Product');

  featureTypeId = '';
  featureValueId = '';

  readonly form = this.fb.nonNullable.group({
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: this.fb.control<number | null>(null),
    barcode: [''],
    weight: this.fb.control<number | null>(null),
    isActive: [true]
  });

  constructor() {
    effect(() => {
      this.state.product();
      this.state.attributes();
    });

    effect(() => {
      if (!this.expanded()) {
        this.sectionActive.set(false);
        this.closeForm();
      }
    });
  }

  valuesForFeatureType() {
    const attr = this.state.attributes().find((a) => a.id === this.featureTypeId);
    return attr?.values ?? [];
  }

  attributesAvailableForAdd() {
    const selected = new Set(Object.keys(this.draftSelections()));
    return this.state.attributes().filter((attr) => !selected.has(attr.id));
  }

  draftFeatureChips(): { attributeId: string; label: string }[] {
    const editingVariant = this.editingVariantId()
      ? this.variants().find((v) => v.id === this.editingVariantId())
      : null;

    return Object.entries(this.draftSelections()).map(([attributeId, valueId]) => {
      const attr = this.state.attributes().find((a) => a.id === attributeId);
      const val = attr?.values.find((v) => v.id === valueId);
      const variantAttr = editingVariant?.attributes.find((a) => a.attributeId === attributeId);

      return {
        attributeId,
        label:
          attr && val
            ? `${attr.name}: ${val.value}`
            : variantAttr
              ? `${variantAttr.attributeName}: ${variantAttr.value}`
              : attributeId
      };
    });
  }

  isComplete(): boolean {
    return (this.state.product()?.variants.length ?? 0) > 0;
  }

  variantAttrs(v: ProductVariantDto): string {
    return v.attributes.map((a) => `${a.attributeName}: ${a.value}`).join(', ');
  }

  openCreate(): void {
    this.expanded.set(true);
    this.sectionActive.set(true);
    const p = this.state.product();
    this.editingVariantId.set(null);
    this.editingSku.set('');
    this.draftSelections.set({});
    this.resetDraftInputs();
    this.form.reset({
      price: p?.price ?? 0,
      compareAtPrice: p?.compareAtPrice ?? null,
      barcode: '',
      weight: p?.weight ?? null,
      isActive: true
    });
    this.formOpen.set(true);
  }

  openEdit(v: ProductVariantDto): void {
    if (this.formOpen() && this.editingVariantId() === v.id) {
      this.closeForm();
      return;
    }

    this.expanded.set(true);
    this.sectionActive.set(true);
    this.editingVariantId.set(v.id);
    this.editingSku.set(v.sku);
    this.draftSelections.set(
      Object.fromEntries(v.attributes.map((a) => [a.attributeId, a.valueId]))
    );
    this.resetDraftInputs();
    this.form.patchValue({
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      barcode: v.barcode ?? '',
      weight: v.weight,
      isActive: v.isActive
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editingVariantId.set(null);
    this.draftSelections.set({});
    this.resetDraftInputs();
  }

  onSectionEdit(): void {
    if (this.sectionActive()) {
      this.sectionActive.set(false);
      this.expanded.set(false);
      this.closeForm();
      return;
    }
    this.sectionActive.set(true);
  }

  addDraftFeature(): void {
    if (!this.featureTypeId || !this.featureValueId) return;
    this.draftSelections.update((current) => ({
      ...current,
      [this.featureTypeId]: this.featureValueId
    }));
    this.resetDraftInputs();
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

  saveForm(): void {
    if (this.form.invalid || this.saving() || !this.hasDraftSelections()) return;

    const productId = this.state.productId();
    if (!productId) return;

    const v = this.form.getRawValue();
    const attributes = this.buildVariantAttributes();

    const payload = {
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      barcode: v.barcode || null,
      weight: v.weight,
      isActive: v.isActive,
      attributes
    };

    const variantId = this.editingVariantId();
    const req$ = variantId
      ? this.api.updateVariant(productId, variantId, payload)
      : this.api.createVariant(productId, payload);

    this.saving.set(true);
    req$.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.state.mergeProduct(saved);
        this.closeForm();
        this.notifications.success(variantId ? 'Variant updated' : 'Variant created');
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(err?.message ?? 'Could not save variant');
      }
    });
  }

  confirmDelete(v: ProductVariantDto): void {
    this.deleteTarget.set(v);
  }

  doDelete(): void {
    const target = this.deleteTarget();
    const productId = this.state.productId();
    if (!target || !productId) return;

    this.saving.set(true);
    this.api.deleteVariant(productId, target.id).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.state.mergeProduct(saved);
        this.notifications.success('Variant deleted');
      },
      error: (err) => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.notifications.error(err?.message ?? 'Could not delete variant. Reserved inventory may block deletion.');
      }
    });
  }

  private resetDraftInputs(): void {
    this.featureTypeId = '';
    this.featureValueId = '';
  }

  private buildVariantAttributes(): ProductVariantAttributeInput[] {
    const editingVariant = this.editingVariantId()
      ? this.variants().find((v) => v.id === this.editingVariantId())
      : null;

    return Object.entries(this.draftSelections())
      .filter(([, valueId]) => !!valueId)
      .map(([attributeId, valueId]) => {
        const attr = this.state.attributes().find((a) => a.id === attributeId);
        const val = attr?.values.find((v) => v.id === valueId);
        const variantAttr = editingVariant?.attributes.find((a) => a.attributeId === attributeId);

        return {
          attributeId,
          attributeName: attr?.name ?? variantAttr?.attributeName ?? '',
          valueId,
          value: val?.value ?? variantAttr?.value ?? ''
        };
      });
  }
}
