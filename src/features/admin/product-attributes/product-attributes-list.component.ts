import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ProductAttributeApiService } from '@features/catalog/data-access/product-attribute-api.service';
import {
  ProductAttributeDto,
  UpsertProductAttributeItem
} from '@features/catalog/models/product-attribute.model';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';

interface AttributeEditorRow {
  id: string | null;
  name: string;
  valuesText: string;
}

@Component({
  selector: 'app-product-attributes-list',
  standalone: true,
  imports: [FormsModule, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Product attributes" description="Define variant attributes like Size and Color. Omitted attributes are deleted on save.">
      <div class="mb-4 flex flex-wrap justify-between gap-3">
        <p class="text-sm text-[var(--text-muted)]">Used when creating product variants.</p>
        <div class="flex gap-2">
          <button type="button" class="admin-action-secondary rounded-lg px-4 py-2 text-sm" (click)="addRow()">Add attribute</button>
          <button type="button" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="saving()" (click)="save()">{{ saving() ? 'Saving…' : 'Save all' }}</button>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading attributes…" />
      } @else if (!rows().length) {
        <div class="admin-glass-card rounded-xl p-8 text-center">
          <p class="font-medium">No attributes yet</p>
          <button type="button" class="admin-section-action-btn mt-4 rounded-lg px-4 py-2 text-sm" (click)="addRow()">Add attribute</button>
        </div>
      } @else {
        <div class="space-y-4">
          @for (row of rows(); track $index; let i = $index) {
            <div class="admin-glass-card space-y-3 rounded-xl p-4">
              <div class="flex items-start justify-between gap-3">
                <label class="block flex-1 space-y-1">
                  <span class="text-sm font-medium">Attribute name</span>
                  <input class="pf-editor-input w-full" [(ngModel)]="row.name" placeholder="Size" />
                </label>
                <button type="button" class="mt-6 text-rose-600 text-sm hover:underline" (click)="removeRow(i)">Remove</button>
              </div>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Values (comma-separated)</span>
                <input class="pf-editor-input w-full" [(ngModel)]="row.valuesText" placeholder="S, M, L, XL" />
              </label>
            </div>
          }
        </div>
      }
    </app-admin-page-shell>
  `
})
export class ProductAttributesListComponent implements OnInit {
  private readonly api = inject(ProductAttributeApiService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly rows = signal<AttributeEditorRow[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (items) => {
        this.rows.set(
          items.map((a) => ({
            id: a.id,
            name: a.name,
            valuesText: a.values.map((v) => v.value).join(', ')
          }))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  addRow(): void {
    this.rows.update((r) => [...r, { id: null, name: '', valuesText: '' }]);
  }

  removeRow(index: number): void {
    this.rows.update((r) => r.filter((_, i) => i !== index));
  }

  save(): void {
    this.saving.set(true);
    const attributes: UpsertProductAttributeItem[] = this.rows()
      .filter((r) => r.name.trim())
      .map((r) => ({
        id: r.id,
        name: r.name.trim(),
        values: r.valuesText
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      }));

    this.api
      .upsert({
        tenantId: requireTenantId(this.auth),
        attributes
      })
      .subscribe({
        next: (saved) => {
          this.rows.set(
            saved.map((a) => ({
              id: a.id,
              name: a.name,
              valuesText: a.values.map((v) => v.value).join(', ')
            }))
          );
          this.saving.set(false);
          this.notifications.success('Attributes saved');
        },
        error: (err) => {
          this.saving.set(false);
          this.notifications.error(err?.message ?? 'Could not save attributes');
        }
      });
  }
}
