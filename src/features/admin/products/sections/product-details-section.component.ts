import { CommonModule } from '@angular/common';
import { afterNextRender, Component, effect, inject, Injector, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Package } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';
import { ProductDetailDto } from '@features/catalog/models/product-admin.model';
import { ProductStatus, productStatusLabel } from '@features/catalog/models/product-status.enum';
import { ProductAdminService } from '../data-access/product-admin.service';
import { ProductFormStateService } from '../data-access/product-form-state.service';

@Component({
  selector: 'app-product-details-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormSectionCardComponent],
  template: `
    <app-admin-form-section-card
      title="Product details"
      subtitle="Name, category, pricing, SEO, status"
      [icon]="sectionIcon"
      [complete]="isComplete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="state.isSectionSaving('details')"
      [canSave]="form.valid && state.categories().length > 0"
      [lastSavedAt]="state.sectionLastSaved('details')"
      (edit)="startEdit()"
      (save)="save()"
      (cancel)="cancelEdit()"
    >
      @if (!state.categories().length) {
        <p class="text-sm text-amber-700 dark:text-amber-200">
          Create at least one category before saving a product.
        </p>
      }

      @if (!editing() && state.product()) {
        <dl class="grid gap-3 sm:grid-cols-2 text-sm">
          <div><dt class="text-[var(--text-muted)]">Name</dt><dd class="font-medium">{{ state.product()!.name }}</dd></div>
          <div><dt class="text-[var(--text-muted)]">Category</dt><dd>{{ state.product()!.categoryName }}</dd></div>
          <div><dt class="text-[var(--text-muted)]">Price</dt><dd>{{ formatPrice(state.product()!.price) }}</dd></div>
          <div><dt class="text-[var(--text-muted)]">Status</dt><dd>{{ statusLabel(state.product()!.status) }}</dd></div>
        </dl>
      } @else {
        <form [formGroup]="form" class="space-y-6" (ngSubmit)="$event.preventDefault()">
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-[var(--text-secondary)]">General</h4>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Product name *</span>
              <input class="pf-editor-input w-full" formControlName="name" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Category *</span>
              <select class="pf-editor-input w-full" formControlName="categoryId">
                <option value="">Select category</option>
                @for (c of state.categories(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Brand</span>
              <select class="pf-editor-input w-full" formControlName="brandId">
                <option value="">None</option>
                @for (b of state.brands(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Short description</span>
              <textarea class="pf-editor-input w-full" formControlName="shortDescription" rows="2"></textarea>
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Description</span>
              <textarea class="pf-editor-input w-full min-h-[100px]" formControlName="description"></textarea>
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Status</span>
              <select class="pf-editor-input w-full" formControlName="status">
                <option [ngValue]="1">Draft</option>
                <option [ngValue]="2">Active</option>
                <option [ngValue]="3">Inactive</option>
                <option [ngValue]="4">Archived</option>
              </select>
            </label>
          </div>

          <div class="space-y-4 border-t border-[var(--border-subtle)] pt-4">
            <h4 class="text-sm font-semibold text-[var(--text-secondary)]">Pricing</h4>
            <div class="grid gap-4 sm:grid-cols-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Price *</span>
                <input class="pf-editor-input w-full" type="number" step="0.01" formControlName="price" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Compare at</span>
                <input class="pf-editor-input w-full" type="number" step="0.01" formControlName="compareAtPrice" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Cost</span>
                <input class="pf-editor-input w-full" type="number" step="0.01" formControlName="costPrice" />
              </label>
            </div>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Weight (kg)</span>
              <input class="pf-editor-input w-full" type="number" step="0.01" formControlName="weight" />
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" formControlName="trackInventory" /> Track inventory
            </label>
          </div>

          <div class="space-y-4 border-t border-[var(--border-subtle)] pt-4">
            <h4 class="text-sm font-semibold text-[var(--text-secondary)]">SEO</h4>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Meta title</span>
              <input class="pf-editor-input w-full" formControlName="metaTitle" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Meta description</span>
              <textarea class="pf-editor-input w-full" formControlName="metaDescription" rows="2"></textarea>
            </label>
          </div>
        </form>
      }
    </app-admin-form-section-card>
  `
})
export class ProductDetailsSectionComponent {
  readonly state = inject(ProductFormStateService);
  private readonly api = inject(ProductAdminService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  readonly sectionIcon = Package;
  readonly expanded = signal(true);
  readonly editing = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    categoryId: ['', Validators.required],
    brandId: [''],
    shortDescription: [''],
    description: [''],
    status: [ProductStatus.Draft as ProductStatus],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null],
    costPrice: [null as number | null],
    weight: [null as number | null],
    trackInventory: [true],
    metaTitle: [''],
    metaDescription: ['']
  });

  constructor() {
    effect(() => {
      const p = this.state.product();
      // Re-sync when reference lists arrive so selects bind correctly.
      this.state.categories();
      this.state.brands();
      if (p && !this.editing()) {
        this.patchFromProduct(p);
      }
      if (this.state.isNew()) {
        this.editing.set(true);
        this.expanded.set(true);
      }
    });
  }

  isComplete(): boolean {
    const p = this.state.product();
    return !!p?.name && !!p?.categoryId;
  }

  startEdit(): void {
    this.editing.set(true);
    afterNextRender(
      () => {
        const p = this.state.product();
        if (p) this.patchFromProduct(p);
      },
      { injector: this.injector }
    );
  }

  cancelEdit(): void {
    const p = this.state.product();
    if (p) {
      this.patchFromProduct(p);
      this.editing.set(false);
    } else if (this.state.isNew()) {
      this.form.reset({
        name: '',
        categoryId: '',
        brandId: '',
        shortDescription: '',
        description: '',
        status: ProductStatus.Draft,
        price: 0,
        compareAtPrice: null,
        costPrice: null,
        weight: null,
        trackInventory: true,
        metaTitle: '',
        metaDescription: ''
      });
    }
  }

  save(): void {
    if (this.form.invalid || !this.state.categories().length) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const tenantId = requireTenantId(this.auth);
    const core = {
      tenantId,
      categoryId: v.categoryId,
      brandId: v.brandId || null,
      name: v.name.trim(),
      shortDescription: v.shortDescription || null,
      description: v.description || null,
      metaTitle: v.metaTitle || null,
      metaDescription: v.metaDescription || null,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      costPrice: v.costPrice,
      weight: v.weight,
      trackInventory: v.trackInventory,
      status: v.status
    };

    const wasNew = this.state.isNew();
    const productId = this.state.productId() || undefined;
    this.state.setSectionSaving('details', true);
    this.api.saveCore(productId, core).subscribe({
      next: (saved) => {
        this.state.setSectionSaving('details', false);
        this.state.markSectionSaved('details');
        this.state.onProductCreated(saved);
        this.patchFromProduct(saved);
        this.editing.set(false);
        if (wasNew) {
          this.notifications.success('Product created — you can now add media, variants, and inventory.');
          void this.router.navigate(['/admin/products', saved.id, 'edit'], { replaceUrl: true });
        } else {
          this.state.mergeProduct(saved);
          this.notifications.success('Product details saved');
        }
      },
      error: (err) => {
        this.state.setSectionSaving('details', false);
        this.notifications.error(err?.message ?? 'Could not save product details');
      }
    });
  }

  private patchFromProduct(p: ProductDetailDto): void {
    this.form.patchValue({
      name: p.name,
      categoryId: p.categoryId,
      brandId: p.brandId ?? '',
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? '',
      status: p.status,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      costPrice: p.costPrice,
      weight: p.weight,
      trackInventory: p.trackInventory,
      metaTitle: p.metaTitle ?? '',
      metaDescription: p.metaDescription ?? ''
    });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  }

  statusLabel(status: ProductStatus): string {
    return productStatusLabel(status);
  }
}
