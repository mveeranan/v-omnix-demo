import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Warehouse } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { NotificationService } from '@core/notifications/notification.service';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';
import { stockRowsFromProduct, VariantStockRow } from './product-variant.util';

type InventoryFormMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-product-inventory-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminFormSectionCardComponent,
    AppTableComponent,
    AdminTableActionComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-form-section-card
      title="Inventory"
      [icon]="sectionIcon"
      [disabled]="!state.sectionsEnabled()"
      [complete]="isComplete()"
      [expanded]="expanded()"
      [expandOnEdit]="false"
      [editing]="false"
      [canSave]="false"
      (expandedChange)="onExpandedChange($event)"
      (edit)="onSectionEdit()"
    >
      @if (hasActiveVariants() && !variantsReady()) {
        <p class="text-sm text-amber-700 dark:text-amber-200">
          Save variants first to set per-variant inventory.
        </p>
      } @else {
        @if (formMode() === 'create' && activeRow(); as row) {
          <div class="admin-glass-card mb-4 space-y-4 rounded-xl p-4">
            <h4 class="text-sm font-semibold">Add inventory</h4>
            <p class="text-sm text-[var(--text-muted)]">{{ productName() }} — {{ row.label }}</p>
            <form class="space-y-4" [formGroup]="setForm" (ngSubmit)="saveCreate()">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Quantity available</span>
                <input class="pf-editor-input w-full" type="number" formControlName="quantityAvailable" min="0" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Low stock threshold</span>
                <input class="pf-editor-input w-full" type="number" formControlName="lowStockThreshold" min="0" />
              </label>
              <div class="flex justify-end gap-2">
                <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="admin-section-action-btn rounded-lg px-4 py-2 text-sm"
                  [disabled]="setForm.invalid || savingSet()"
                >
                  {{ savingSet() ? 'Saving…' : 'Create inventory' }}
                </button>
              </div>
            </form>
          </div>
        }

        @if (formMode() === 'edit' && activeRow(); as row) {
          <div class="admin-glass-card mb-4 space-y-4 rounded-xl p-4">
            <h4 class="text-sm font-semibold">Edit inventory</h4>
            <p class="text-sm text-[var(--text-muted)]">{{ productName() }} — {{ row.label }}</p>
            <form class="space-y-4" [formGroup]="setForm" (ngSubmit)="saveSet()">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Quantity available</span>
                <input class="pf-editor-input w-full" type="number" formControlName="quantityAvailable" min="0" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Low stock threshold</span>
                <input class="pf-editor-input w-full" type="number" formControlName="lowStockThreshold" min="0" />
              </label>
              <div class="flex justify-end gap-2">
                <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeForm()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="admin-section-action-btn rounded-lg px-4 py-2 text-sm"
                  [disabled]="setForm.invalid || savingSet()"
                >
                  {{ savingSet() ? 'Saving…' : 'Save inventory' }}
                </button>
              </div>
            </form>
          </div>
        }

        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__index">#</th>
                <th>Item</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Low stock</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (row of visibleStockRows(); track row.variantId ?? 'simple'; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__index">{{ i + 1 }}</td>
                  <td>
                    <div class="text-sm font-medium">{{ productName() }} — {{ row.label }}</div>
                    @if (row.sku) {
                      <div class="text-xs text-[var(--text-muted)]">{{ row.sku }}</div>
                    }
                  </td>
                  <td>{{ row.inventoryId ? row.quantityAvailable : '—' }}</td>
                  <td>{{ row.inventoryId ? row.quantityReserved : '—' }}</td>
                  <td>{{ row.inventoryId ? row.lowStockThreshold : '—' }}</td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      @if (!row.inventoryId) {
                        <app-admin-table-action label="Add" variant="edit" (action)="openCreate(row)" />
                      } @else {
                        <app-admin-table-action label="Edit" variant="edit" (action)="openEdit(row)" />
                        <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(row)" />
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
      }
    </app-admin-form-section-card>

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete inventory"
      [message]="deleteMessage()"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class ProductInventorySectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly sectionIcon = Warehouse;
  readonly expanded = signal(false);
  readonly sectionActive = signal(false);
  readonly savingSet = signal(false);
  readonly savingDelete = signal(false);
  readonly stockRows = signal<VariantStockRow[]>([]);
  readonly formMode = signal<InventoryFormMode>(null);
  readonly activeRow = signal<VariantStockRow | null>(null);
  readonly deleteTarget = signal<VariantStockRow | null>(null);

  readonly productName = computed(() => this.state.product()?.name ?? 'Product');
  readonly trackInventoryEnabled = computed(() => this.state.product()?.trackInventory ?? false);
  readonly visibleStockRows = computed(() => {
    const active = this.activeRow();
    if (!active || !this.formMode()) {
      return this.stockRows();
    }
    return this.stockRows().filter((row) => !this.isSameStockRow(row, active));
  });

  private readonly trackInventoryMessage =
    'Enable track inventory in product details to create or edit inventory.';

  readonly setForm = this.fb.nonNullable.group({
    quantityAvailable: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      const p = this.state.product();
      this.state.attributes();
      if (p) {
        this.patchFromProduct();
      }
    });

    effect(() => {
      if (!this.trackInventoryEnabled() && this.expanded()) {
        this.setSectionExpanded(false);
      }
    });

    effect(() => {
      if (!this.expanded()) {
        this.sectionActive.set(false);
        this.closeForm();
      }
    });
  }

  hasActiveVariants(): boolean {
    return (this.state.product()?.variants.filter((v) => v.isActive).length ?? 0) > 0;
  }

  variantsReady(): boolean {
    return this.hasActiveVariants() && (this.state.product()?.variants.length ?? 0) > 0;
  }

  isComplete(): boolean {
    const p = this.state.product();
    if (!p?.trackInventory) return true;
    return p.inventory.length > 0;
  }

  deleteMessage(): string {
    const row = this.deleteTarget();
    if (!row) return '';
    if (row.quantityReserved > 0) {
      return 'Cannot delete inventory while quantity is reserved.';
    }
    return `Delete inventory for ${row.label}?`;
  }

  onExpandedChange(next: boolean): void {
    if (next && !this.trackInventoryEnabled()) {
      this.notifications.warning(this.trackInventoryMessage);
      return;
    }
    this.setSectionExpanded(next);
  }

  onSectionEdit(): void {
    if (!this.trackInventoryEnabled()) {
      this.notifications.warning(this.trackInventoryMessage);
      return;
    }

    if (this.expanded()) {
      this.setSectionExpanded(false);
      return;
    }
    this.setSectionExpanded(true);
  }

  openCreate(row: VariantStockRow): void {
    if (!this.trackInventoryEnabled()) {
      this.notifications.warning(this.trackInventoryMessage);
      return;
    }

    this.setSectionExpanded(true);
    this.activeRow.set(row);
    this.formMode.set('create');
    this.setForm.reset({ quantityAvailable: 0, lowStockThreshold: 5 });
  }

  openEdit(row: VariantStockRow): void {
    if (!this.trackInventoryEnabled()) {
      this.notifications.warning(this.trackInventoryMessage);
      return;
    }

    if (
      this.formMode() === 'edit' &&
      this.activeRow()?.inventoryId === row.inventoryId
    ) {
      this.closeForm();
      return;
    }

    this.setSectionExpanded(true);
    this.activeRow.set(row);
    this.formMode.set('edit');
    this.patchSetFormFromRow(row);
  }

  closeForm(): void {
    this.formMode.set(null);
    this.activeRow.set(null);
  }

  saveCreate(): void {
    if (this.setForm.invalid || this.savingSet()) return;

    const productId = this.state.productId();
    const row = this.activeRow();
    if (!productId || !row) return;

    const v = this.setForm.getRawValue();
    this.savingSet.set(true);
    this.api
      .createInventory(productId, {
        variantId: row.variantId,
        quantityAvailable: v.quantityAvailable,
        lowStockThreshold: v.lowStockThreshold
      })
      .subscribe({
        next: (saved) => {
          this.savingSet.set(false);
          this.state.mergeProduct(saved);
          this.patchFromProduct();
          this.closeForm();
          this.notifications.success('Inventory created');
        },
        error: (err) => {
          this.savingSet.set(false);
          this.notifications.error(err?.message ?? 'Could not create inventory');
        }
      });
  }

  saveSet(): void {
    if (this.setForm.invalid || this.savingSet()) return;

    const productId = this.state.productId();
    const row = this.activeRow();
    if (!productId || !row?.inventoryId) return;

    const v = this.setForm.getRawValue();
    this.savingSet.set(true);
    this.api
      .updateInventory(productId, row.inventoryId, {
        quantityAvailable: v.quantityAvailable,
        lowStockThreshold: v.lowStockThreshold
      })
      .subscribe({
        next: (saved) => {
          this.savingSet.set(false);
          this.state.mergeProduct(saved);
          this.refreshActiveRow();
          this.closeForm();
          this.notifications.success('Inventory updated');
        },
        error: (err) => {
          this.savingSet.set(false);
          this.notifications.error(err?.message ?? 'Could not update inventory');
        }
      });
  }

  confirmDelete(row: VariantStockRow): void {
    if (row.quantityReserved > 0) {
      this.notifications.error('Cannot delete inventory while quantity is reserved.');
      return;
    }
    this.deleteTarget.set(row);
  }

  doDelete(): void {
    const row = this.deleteTarget();
    const productId = this.state.productId();
    if (!row?.inventoryId || !productId) return;

    if (row.quantityReserved > 0) {
      this.notifications.error('Cannot delete inventory while quantity is reserved.');
      this.deleteTarget.set(null);
      return;
    }

    this.savingDelete.set(true);
    this.api.deleteInventory(productId, row.inventoryId).subscribe({
      next: (saved) => {
        this.savingDelete.set(false);
        this.deleteTarget.set(null);
        this.state.mergeProduct(saved);
        this.patchFromProduct();
        if (this.activeRow()?.inventoryId === row.inventoryId) {
          this.closeForm();
        }
        this.notifications.success('Inventory deleted');
      },
      error: (err) => {
        this.savingDelete.set(false);
        this.deleteTarget.set(null);
        this.notifications.error(err?.message ?? 'Could not delete inventory');
      }
    });
  }

  private patchSetFormFromRow(row: VariantStockRow): void {
    this.setForm.patchValue({
      quantityAvailable: row.quantityAvailable,
      lowStockThreshold: row.lowStockThreshold
    });
  }

  private refreshActiveRow(): void {
    this.patchFromProduct();
    const current = this.activeRow();
    if (!current) return;

    const key = current.variantId ?? 'simple';
    const updated = this.stockRows().find((r) => (r.variantId ?? 'simple') === key);
    if (updated) {
      this.activeRow.set(updated);
      this.patchSetFormFromRow(updated);
    }
  }

  private patchFromProduct(): void {
    const p = this.state.product();
    if (!p) return;
    this.stockRows.set(stockRowsFromProduct(p, this.state.attributes()));
  }

  private setSectionExpanded(next: boolean): void {
    if (next) {
      this.sectionActive.set(true);
    } else {
      this.sectionActive.set(false);
      this.closeForm();
    }
    this.expanded.set(next);
  }

  private isSameStockRow(a: VariantStockRow, b: VariantStockRow): boolean {
    if (a.inventoryId && b.inventoryId) {
      return a.inventoryId === b.inventoryId;
    }
    return (a.variantId ?? 'simple') === (b.variantId ?? 'simple');
  }
}
