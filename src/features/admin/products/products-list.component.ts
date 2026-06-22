import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AppTableComponent } from '@shared/ui/app-table.component';
import { AppEmptyStateComponent } from '@shared/ui/app-empty-state.component';
import { AdminDataTablePaginationComponent } from '@shared/ui/admin-data-table-pagination.component';
import { AdminStatusBadgeComponent } from '@shared/ui/admin-status-badge.component';
import { AdminTableActionComponent } from '@shared/ui/admin-table-action.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ConfirmDialogComponent } from '@shared/ui/confirm-dialog.component';
import { ProductAdminService } from './data-access/product-admin.service';
import { CategoryAdminService } from '../data-access/category-admin.service';
import { ProductListItemDto, ProductListFilters } from '@features/catalog/models/product-admin.model';
import { parseProductStatus, productStatusLabel, ProductStatus } from '@features/catalog/models/product-status.enum';
import { AdminStatusBadgeVariant } from '@shared/ui/admin-status-badge.component';
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
    AdminDataTablePaginationComponent,
    AdminStatusBadgeComponent,
    AdminTableActionComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent
  ],
  template: `
    <app-admin-page-shell eyebrow="Catalog" title="Products" description="Manage your product catalog, pricing, and inventory.">
      <a admin-page-actions routerLink="/admin/products/new" class="admin-section-action-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm">+ Add product</a>

      @if (!hasCategories()) {
        <div class="mb-4 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
          Create at least one category before adding products.
          <a routerLink="/admin/categories" class="ml-1 font-semibold underline">Go to Categories</a>
        </div>
      }

      <div class="admin-data-table-toolbar">
        <p class="admin-data-table-toolbar__summary">
          Showing {{ result()?.items?.length ?? 0 }} of {{ result()?.totalCount ?? 0 }} products
        </p>
        <div class="admin-data-table-toolbar__filters">
          <input class="pf-editor-input" placeholder="Search by name" [(ngModel)]="search" (ngModelChange)="load()" />
          <select class="pf-editor-input" [(ngModel)]="statusFilter" (ngModelChange)="load()">
            <option value="">All statuses</option>
            <option value="2">Active</option>
            <option value="1">Draft</option>
            <option value="3">Inactive</option>
            <option value="4">Archived</option>
          </select>
          <select class="pf-editor-input" [(ngModel)]="pageSize" (ngModelChange)="load()">
            <option [ngValue]="10">10 per page</option>
            <option [ngValue]="25">25 per page</option>
            <option [ngValue]="50">50 per page</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner label="Loading products…" />
      } @else if (!result()?.items?.length) {
        <app-empty-state title="No products yet" description="Add your first product to start selling." [icon]="packageIcon">
          <a routerLink="/admin/products/new" class="admin-section-action-btn mt-4 inline-flex rounded-lg px-4 py-2 text-sm">Add product</a>
        </app-empty-state>
      } @else {
        <app-table>
          <table class="admin-data-table">
            <thead>
              <tr>
                <th class="admin-data-table__checkbox"><input type="checkbox" [checked]="allSelected()" (change)="toggleAll($event)" /></th>
                <th class="admin-data-table__col-product">Product</th>
                <th class="admin-data-table__col-category">Category</th>
                <th class="admin-data-table__col-price">Price</th>
                <th class="admin-data-table__col-variants">Variants</th>
                <th class="admin-data-table__col-status">Status</th>
                <th class="admin-data-table__col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of result()!.items; track p.id; let i = $index) {
                <tr class="admin-data-table__row">
                  <td class="admin-data-table__checkbox"><input type="checkbox" [checked]="selected().has(p.id)" (change)="toggleOne(p.id)" /></td>
                  <td class="admin-data-table__col-product">
                    <div class="admin-data-table__entity">
                      <img [src]="p.primaryImageUrl || placeholderImage" alt="" width="40" height="40" class="admin-data-table__entity-thumb" />
                      <div class="admin-data-table__entity-text">
                        <div class="admin-data-table__entity-title">{{ p.name }}</div>
                        <div class="admin-data-table__entity-subtitle">ID: #{{ rowNumber(i) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="admin-data-table__col-category">{{ p.categoryName }}</td>
                  <td class="admin-data-table__col-price"><span class="admin-data-table__price">{{ format(p.price) }}</span></td>
                  <td class="admin-data-table__col-variants">{{ p.variantCount }}</td>
                  <td class="admin-data-table__col-status">
                    <app-admin-status-badge [label]="statusLabel(p.status)" [variant]="statusVariant(p.status)" />
                  </td>
                  <td class="admin-data-table__col-actions">
                    <div class="admin-data-table__actions">
                      <app-admin-table-action label="Edit" variant="edit" [routerLink]="['/admin/products', p.id, 'edit']" />
                      <app-admin-table-action label="Duplicate" variant="duplicate" (action)="duplicate(p.id)" />
                      <app-admin-table-action label="Delete" variant="delete" (action)="confirmDelete(p)" />
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </app-table>
        <app-admin-data-table-pagination
          [total]="result()!.totalCount"
          [page]="page()"
          [pageSize]="pageSize"
          itemLabel="products"
          (pageChange)="onPage($event)"
        />
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
  private readonly categoryApi = inject(CategoryAdminService);
  readonly packageIcon = Package;
  readonly placeholderImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

  readonly loading = signal(true);
  readonly hasCategories = signal(true);
  readonly result = signal<{ items: ProductListItemDto[]; totalCount: number; page: number; pageSize: number } | null>(null);
  readonly page = signal(1);
  readonly selected = signal(new Set<string>());
  readonly deleteTarget = signal<ProductListItemDto | null>(null);

  search = '';
  statusFilter = '';
  pageSize = 25;

  ngOnInit(): void {
    this.categoryApi.list().subscribe({
      next: (cats) => this.hasCategories.set(cats.length > 0)
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filters: ProductListFilters = {
      search: this.search || undefined,
      status: parseProductStatus(this.statusFilter),
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

  rowNumber(index: number): number {
    return (this.page() - 1) * this.pageSize + index + 1;
  }

  format(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  }

  statusLabel(status: ProductListItemDto['status']): string {
    return productStatusLabel(status);
  }

  statusVariant(status: ProductListItemDto['status']): AdminStatusBadgeVariant {
    switch (status) {
      case ProductStatus.Active:
        return 'active';
      case ProductStatus.Draft:
        return 'draft';
      case ProductStatus.Inactive:
        return 'inactive';
      case ProductStatus.Archived:
        return 'archived';
      default:
        return 'neutral';
    }
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

  confirmDelete(p: ProductListItemDto): void {
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
