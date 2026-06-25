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

type InventoryModalMode = 'create' | 'set' | 'adjust' | null;

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
      [(expanded)]="expanded"
      [editing]="false"
      [canSave]="false"
    >
      @if (!trackInventory()) {
        <p class="text-sm text-[var(--text-muted)]">Inventory tracking is disabled for this product.</p>
      } @else if (hasActiveVariants() && !variantsReady()) {
        <p class="text-sm text-amber-700 dark:text-amber-200">
          Save variants first to set per-variant inventory.
        </p>
      } @else {
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
              @for (row of stockRows(); track row.variantId ?? 'simple'; let i = $index) {
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
                        <app-admin-table-action label="Set qty" variant="edit" (action)="openSet(row)" />
                        <app-admin-table-action label="Adjust" variant="edit" (action)="openAdjust(row)" />
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

    @if (modalMode()) {
      <div class="fixed inset-0 z-50 grid place-items-center p-4">
        <div class="admin-modal-backdrop absolute inset-0" (click)="closeModal()"></div>
        <form
          class="admin-glass-card relative w-full max-w-md space-y-4 rounded-xl p-6"
          [formGroup]="modalForm"
          (ngSubmit)="submitModal()"
        >
          <h3 class="text-lg font-semibold">{{ modalTitle() }}</h3>
          @if (activeRow(); as row) {
            <p class="text-sm text-[var(--text-muted)]">{{ productName() }} — {{ row.label }}</p>
          }

          @if (modalMode() === 'create' || modalMode() === 'set') {
            <label class="block space-y-1">
              <span class="text-sm font-medium">Quantity available</span>
              <input class="pf-editor-input w-full" type="number" formControlName="quantityAvailable" min="0" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Low stock threshold</span>
              <input class="pf-editor-input w-full" type="number" formControlName="lowStockThreshold" min="0" />
            </label>
          }

          @if (modalMode() === 'adjust') {
            <label class="block space-y-1">
              <span class="text-sm font-medium">Quantity change (+/-)</span>
              <input class="pf-editor-input w-full" type="number" formControlName="quantityChange" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Notes (optional)</span>
              <input class="pf-editor-input w-full" formControlName="notes" placeholder="Reason for adjustment" />
            </label>
          }

          <div class="flex justify-end gap-2">
            <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="closeModal()">
              Cancel
            </button>
            <button
              type="submit"
              class="admin-section-action-btn rounded-lg px-4 py-2 text-sm"
              [disabled]="modalForm.invalid || saving()"
            >
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    }

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
  readonly saving = signal(false);
  readonly stockRows = signal<VariantStockRow[]>([]);
  readonly modalMode = signal<InventoryModalMode>(null);
  readonly activeRow = signal<VariantStockRow | null>(null);
  readonly deleteTarget = signal<VariantStockRow | null>(null);

  readonly productName = computed(() => this.state.product()?.name ?? 'Product');

  readonly modalForm = this.fb.nonNullable.group({
    quantityAvailable: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [5, [Validators.required, Validators.min(0)]],
    quantityChange: [0, Validators.required],
    notes: ['']
  });

  constructor() {
    effect(() => {
      const p = this.state.product();
      this.state.attributes();
      if (p) {
        this.patchFromProduct();
      }
    });
  }

  trackInventory(): boolean {
    return this.state.product()?.trackInventory ?? false;
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

  modalTitle(): string {
    switch (this.modalMode()) {
      case 'create':
        return 'Add inventory';
      case 'set':
        return 'Set quantity';
      case 'adjust':
        return 'Adjust stock';
      default:
        return '';
    }
  }

  deleteMessage(): string {
    const row = this.deleteTarget();
    if (!row) return '';
    if (row.quantityReserved > 0) {
      return 'Cannot delete inventory while quantity is reserved.';
    }
    return `Delete inventory for ${row.label}?`;
  }

  openCreate(row: VariantStockRow): void {
    this.activeRow.set(row);
    this.modalMode.set('create');
    this.modalForm.reset({
      quantityAvailable: 0,
      lowStockThreshold: 5,
      quantityChange: 0,
      notes: ''
    });
  }

  openSet(row: VariantStockRow): void {
    this.activeRow.set(row);
    this.modalMode.set('set');
    this.modalForm.reset({
      quantityAvailable: row.quantityAvailable,
      lowStockThreshold: row.lowStockThreshold,
      quantityChange: 0,
      notes: ''
    });
  }

  openAdjust(row: VariantStockRow): void {
    this.activeRow.set(row);
    this.modalMode.set('adjust');
    this.modalForm.reset({
      quantityAvailable: row.quantityAvailable,
      lowStockThreshold: row.lowStockThreshold,
      quantityChange: 0,
      notes: ''
    });
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.activeRow.set(null);
  }

  submitModal(): void {
    if (this.modalForm.invalid || this.saving()) return;

    const productId = this.state.productId();
    const row = this.activeRow();
    const mode = this.modalMode();
    if (!productId || !row || !mode) return;

    const v = this.modalForm.getRawValue();
    let req$;

    if (mode === 'create') {
      req$ = this.api.createInventory(productId, {
        variantId: row.variantId,
        quantityAvailable: v.quantityAvailable,
        lowStockThreshold: v.lowStockThreshold
      });
    } else if (mode === 'set' && row.inventoryId) {
      req$ = this.api.updateInventory(productId, row.inventoryId, {
        quantityAvailable: v.quantityAvailable,
        lowStockThreshold: v.lowStockThreshold
      });
    } else if (mode === 'adjust' && row.inventoryId) {
      req$ = this.api.adjustInventory(productId, row.inventoryId, {
        quantityChange: v.quantityChange,
        notes: v.notes || undefined
      });
    } else {
      return;
    }

    this.saving.set(true);
    req$.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.state.mergeProduct(saved);
        this.patchFromProduct();
        this.closeModal();
        this.notifications.success('Inventory saved');
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(err?.message ?? 'Could not save inventory');
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

    this.saving.set(true);
    this.api.deleteInventory(productId, row.inventoryId).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.state.mergeProduct(saved);
        this.patchFromProduct();
        this.notifications.success('Inventory deleted');
      },
      error: (err) => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.notifications.error(err?.message ?? 'Could not delete inventory');
      }
    });
  }

  private patchFromProduct(): void {
    const p = this.state.product();
    if (!p) return;
    this.stockRows.set(stockRowsFromProduct(p, this.state.attributes()));
  }
}
