import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AppTableComponent } from '../../../shared/ui/app-table.component';
import { AppEmptyStateComponent } from '../../../shared/ui/app-empty-state.component';
import { PaginationComponent } from '../../../shared/ui/pagination.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { ProductAdminService } from './data-access/product-admin.service';
import { ProductListFilters, StoreProduct, productStockQuantity } from '../../store/models/product.model';
import { Package } from 'lucide-angular';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    AdminPageShellComponent,
    AppTableComponent,
    AppEmptyStateComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Products" description="Manage your product catalog, pricing, and inventory.">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-[var(--text-muted)]">Showing {{ result()?.items?.length ?? 0 }} of {{ result()?.total ?? 0 }} products</p>
        <a routerLink="/admin/products/new" class="admin-section-action-btn inline-flex rounded-lg px-4 py-2 text-sm">Add product</a>
      </div>

      <div class="mb-4 grid gap-3 md:grid-cols-4">
        <input class="pf-editor-input md:col-span-2" placeholder="Search name or SKU" [(ngModel)]="search" (ngModelChange)="load()" />
        <select class="pf-editor-input" [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
        <select class="pf-editor-input" [(ngModel)]="pageSize" (ngModelChange)="load()">
          <option [ngValue]="10">10 per page</option>
          <option [ngValue]="25">25 per page</option>
          <option [ngValue]="50">50 per page</option>
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading products…" />
      } @else if (!result()?.items?.length) {
        <app-empty-state title="No products yet" description="Add your first product to start selling." [icon]="packageIcon">
          <a routerLink="/admin/products/new" class="admin-section-action-btn mt-4 inline-flex rounded-lg px-4 py-2 text-sm">Add product</a>
        </app-empty-state>
      } @else {
        <app-table>
          <table class="admin-bookings-table w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr>
                <th class="p-3"><input type="checkbox" [checked]="allSelected()" (change)="toggleAll($event)" /></th>
                <th class="p-3">Product</th>
                <th class="p-3">SKU</th>
                <th class="p-3">Category</th>
                <th class="p-3">Price</th>
                <th class="p-3">Stock</th>
                <th class="p-3">Status</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of result()!.items; track p.id) {
                <tr class="admin-bookings-table__row border-t">
                  <td class="p-3"><input type="checkbox" [checked]="selected().has(p.id)" (change)="toggleOne(p.id)" /></td>
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <img [src]="p.imageUrl" alt="" class="h-10 w-10 rounded object-cover" />
                      <span class="font-medium">{{ p.name }}</span>
                    </div>
                  </td>
                  <td class="p-3 text-[var(--text-muted)]">{{ p.sku || '—' }}</td>
                  <td class="p-3">{{ p.category }}</td>
                  <td class="p-3">{{ format(p.price, p.currency) }}</td>
                  <td class="p-3">{{ stockLabel(p) }}</td>
                  <td class="p-3"><span class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize dark:bg-zinc-800">{{ p.status }}</span></td>
                  <td class="p-3">
                    <div class="flex flex-wrap gap-2">
                      <a [routerLink]="['/admin/products', p.id, 'edit']" class="text-indigo-600 hover:underline">Edit</a>
                      <button type="button" class="text-[var(--text-muted)] hover:underline" (click)="duplicate(p.id)">Duplicate</button>
                      <button type="button" class="text-rose-600 hover:underline" (click)="confirmDelete(p)">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <div class="mt-6">
          <app-pagination [total]="result()!.total" [page]="page()" [pageSize]="pageSize" (pageChange)="onPage($event)" />
        </div>
      }
    </app-admin-page-shell>

    <app-confirm-dialog
      [open]="!!deleteTarget()"
      title="Delete product"
      [message]="'Delete ' + (deleteTarget()?.name ?? '') + '?'"
      confirmLabel="Delete"
      [danger]="true"
      (confirmed)="doDelete()"
      (cancelled)="deleteTarget.set(null)"
    />
  `
})
export class ProductsListComponent implements OnInit {
  private readonly api = inject(ProductAdminService);
  readonly packageIcon = Package;

  readonly loading = signal(true);
  readonly result = signal<{ items: StoreProduct[]; total: number } | null>(null);
  readonly page = signal(1);
  readonly selected = signal(new Set<string>());
  readonly deleteTarget = signal<StoreProduct | null>(null);

  search = '';
  statusFilter = '';
  pageSize = 25;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filters: ProductListFilters = {
      search: this.search || undefined,
      status: (this.statusFilter as ProductListFilters['status']) || undefined,
      page: this.page(),
      pageSize: this.pageSize
    };
    this.api.list(filters).subscribe({
      next: (r) => {
        this.result.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPage(p: number): void {
    this.page.set(p);
    this.load();
  }

  format(value: number, currency: string): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  }

  stockLabel(p: StoreProduct): string {
    const qty = productStockQuantity(p);
    return qty > 0 ? String(qty) : 'Out of stock';
  }

  allSelected(): boolean {
    const items = this.result()?.items ?? [];
    return items.length > 0 && items.every((p) => this.selected().has(p.id));
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set<string>();
    if (checked) this.result()?.items.forEach((p) => next.add(p.id));
    this.selected.set(next);
  }

  toggleOne(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  duplicate(id: string): void {
    this.api.duplicate(id).subscribe(() => this.load());
  }

  confirmDelete(p: StoreProduct): void {
    this.deleteTarget.set(p);
  }

  doDelete(): void {
    const p = this.deleteTarget();
    if (!p) return;
    this.api.delete(p.id).subscribe(() => {
      this.deleteTarget.set(null);
      this.load();
    });
  }
}
