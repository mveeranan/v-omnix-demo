import { afterNextRender, Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Warehouse } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { NotificationService } from '@core/notifications/notification.service';
import { SaveInventoryItem } from '@features/catalog/models/product-admin.model';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';
import { stockRowsFromProduct, VariantStockRow } from './product-variant.util';

@Component({
  selector: 'app-product-inventory-section',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AdminFormSectionCardComponent],
  template: `
    <app-admin-form-section-card
      title="Inventory"
      [icon]="sectionIcon"
      [disabled]="!state.sectionsEnabled()"
      [complete]="isComplete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="state.isSectionSaving('inventory')"
      [canSave]="canSave()"
      [lastSavedAt]="state.sectionLastSaved('inventory')"
      (edit)="startEdit()"
      (save)="save()"
      (cancel)="cancelEdit()"
    >
      @if (!trackInventory()) {
        <p class="text-sm text-[var(--text-muted)]">Inventory tracking is disabled for this product.</p>
      } @else if (!editing() && state.product()) {
        @if (hasActiveVariants()) {
          <ul class="space-y-2 text-sm">
            @for (row of stockRows(); track row.variantId) {
              <li class="rounded-lg border border-[var(--border)] px-3 py-2">
                <span class="font-medium">{{ productName() }} — {{ row.label }}</span>
                <span class="text-[var(--text-muted)]">
                  — Qty {{ row.quantityAvailable }}, low stock {{ row.lowStockThreshold }}
                </span>
              </li>
            }
          </ul>
        } @else {
          <dl class="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-[var(--text-muted)]">Quantity available</dt>
              <dd class="font-medium">{{ simpleQty() }}</dd>
            </div>
            <div>
              <dt class="text-[var(--text-muted)]">Low stock threshold</dt>
              <dd class="font-medium">{{ simpleLowStock() }}</dd>
            </div>
          </dl>
        }
      } @else if (trackInventory()) {
        @if (hasActiveVariants()) {
          @if (!stockRows().length) {
            <p class="text-sm text-amber-700 dark:text-amber-200">
              Save variants first to set per-variant inventory.
            </p>
          }
          @for (row of stockRows(); track row.variantId) {
            <div class="mb-3 grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-3">
              <span class="text-sm font-medium sm:col-span-3">{{ productName() }} — {{ row.label }}</span>
              <label class="block space-y-1">
                <span class="text-xs">Qty</span>
                <input class="pf-editor-input w-full" type="number" [(ngModel)]="row.quantityAvailable" />
              </label>
              <label class="block space-y-1">
                <span class="text-xs">Low stock</span>
                <input class="pf-editor-input w-full" type="number" [(ngModel)]="row.lowStockThreshold" />
              </label>
            </div>
          }
        } @else {
          <form [formGroup]="simpleForm" class="space-y-4">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Quantity available</span>
              <input class="pf-editor-input w-full" type="number" formControlName="stockQuantity" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Low stock threshold</span>
              <input class="pf-editor-input w-full" type="number" formControlName="lowStockThreshold" />
            </label>
          </form>
        }
      }
    </app-admin-form-section-card>
  `
})
export class ProductInventorySectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly injector = inject(Injector);

  readonly sectionIcon = Warehouse;
  readonly expanded = signal(false);
  readonly editing = signal(false);
  readonly stockRows = signal<VariantStockRow[]>([]);
  readonly productName = computed(() => this.state.product()?.name ?? 'Product');

  readonly simpleForm = this.fb.nonNullable.group({
    stockQuantity: [0, Validators.min(0)],
    lowStockThreshold: [5, Validators.min(0)]
  });

  constructor() {
    effect(() => {
      const p = this.state.product();
      this.state.attributes();
      if (p && !this.editing()) {
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

  simpleQty(): number {
    const inv = this.state.product()?.inventory.find((i) => !i.variantId);
    return inv?.quantityAvailable ?? 0;
  }

  simpleLowStock(): number {
    const inv = this.state.product()?.inventory.find((i) => !i.variantId);
    return inv?.lowStockThreshold ?? 5;
  }

  isComplete(): boolean {
    const p = this.state.product();
    if (!p?.trackInventory) return true;
    return p.inventory.length > 0;
  }

  canSave(): boolean {
    if (!this.state.productId() || !this.trackInventory()) return false;
    if (this.hasActiveVariants()) return this.stockRows().length > 0;
    return this.simpleForm.valid;
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

  save(): void {
    const productId = this.state.productId();
    const p = this.state.product();
    if (!productId || !p?.trackInventory) return;

    const activeVariants = p.variants.filter((v) => v.isActive);
    let items: SaveInventoryItem[] = [];

    if (activeVariants.length > 0) {
      items = this.stockRows().map((row) => ({
        variantId: row.variantId,
        quantityAvailable: row.quantityAvailable,
        lowStockThreshold: row.lowStockThreshold
      }));
    } else {
      const v = this.simpleForm.getRawValue();
      items = [
        {
          variantId: null,
          quantityAvailable: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold
        }
      ];
    }

    this.state.setSectionSaving('inventory', true);
    this.api.saveInventory(productId, items).subscribe({
      next: (saved) => {
        this.state.setSectionSaving('inventory', false);
        this.state.markSectionSaved('inventory');
        if (saved) {
          this.state.mergeProduct(saved);
          this.patchFromProduct();
        }
        this.editing.set(false);
        this.notifications.success('Inventory saved');
      },
      error: (err) => {
        this.state.setSectionSaving('inventory', false);
        this.notifications.error(err?.message ?? 'Could not save inventory');
      }
    });
  }

  private patchFromProduct(): void {
    const p = this.state.product();
    if (!p) return;
    this.stockRows.set(stockRowsFromProduct(p, this.state.attributes()));
    const simple = p.inventory.find((i) => !i.variantId);
    this.simpleForm.patchValue({
      stockQuantity: simple?.quantityAvailable ?? 0,
      lowStockThreshold: simple?.lowStockThreshold ?? 5
    });
  }
}
