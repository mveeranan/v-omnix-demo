import { CommonModule } from '@angular/common';
import { afterNextRender, Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
import { RichTextEditorComponent } from '@shared/ui/rich-text-editor.component';

@Component({
  selector: 'app-product-details-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminFormSectionCardComponent, RichTextEditorComponent],
  template: `
    <app-admin-form-section-card
      title="Product details"
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
          @if (state.product()!.shortDescription) {
            <div class="sm:col-span-2">
              <dt class="text-[var(--text-muted)]">Short description</dt>
              <dd class="mt-1 text-[var(--text-secondary)]">{{ state.product()!.shortDescription }}</dd>
            </div>
          }
          @if (state.product()!.description) {
            <div class="sm:col-span-2">
              <dt class="text-[var(--text-muted)]">Description</dt>
              <dd class="rich-text-content mt-1" [innerHTML]="descriptionPreview()"></dd>
            </div>
          }
        </dl>
      } @else {
        <form [formGroup]="form" class="space-y-6" (ngSubmit)="$event.preventDefault()">
          @if (!state.isNew()) {
            <div class="product-status-bar">
              <div class="product-status-bar__text">
                <span class="product-status-bar__label">Status</span>
                <p class="product-status-bar__hint">Active products are visible in your store. Draft stays hidden.</p>
              </div>
              <div class="product-status-toggle" role="group" aria-label="Product status">
                <button
                  type="button"
                  class="product-status-toggle__btn"
                  [class.product-status-toggle__btn--active]="isStatusSelected(ProductStatus.Draft)"
                  [class.product-status-toggle__btn--draft]="isStatusSelected(ProductStatus.Draft)"
                  (click)="setStatus(ProductStatus.Draft)"
                >
                  Draft
                </button>
                <button
                  type="button"
                  class="product-status-toggle__btn"
                  [class.product-status-toggle__btn--active]="isStatusSelected(ProductStatus.Active)"
                  [class.product-status-toggle__btn--live]="isStatusSelected(ProductStatus.Active)"
                  (click)="setStatus(ProductStatus.Active)"
                >
                  Active
                </button>
              </div>
            </div>
          }

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
            <div class="block space-y-1">
              <span class="text-sm font-medium">Short description</span>
              <p class="text-xs text-[var(--text-muted)]">Brief summary shown under the product title on your store. Also used in search.</p>
              <textarea class="pf-editor-input w-full" formControlName="shortDescription" rows="2"></textarea>
            </div>
            <div class="block space-y-1">
              <span class="text-sm font-medium">Description</span>
              <app-rich-text-editor formControlName="description" placeholder="Describe your product…" />
            </div>
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
  `,
  styles: `
    .product-status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-subtle, rgb(226 232 240));
    }

    .product-status-bar__text {
      flex: 1;
      min-width: 12rem;
    }

    .product-status-bar__label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary, rgb(15 23 42));
    }

    .product-status-bar__hint {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-muted, rgb(100 116 139));
    }

    .product-status-toggle {
      display: inline-flex;
      flex-shrink: 0;
      padding: 0.2rem;
      border-radius: 0.625rem;
      background: rgb(241 245 249);
      border: 1px solid rgb(226 232 240);
    }

    :host-context(.dark) .product-status-toggle {
      background: rgb(39 39 42);
      border-color: rgb(63 63 70);
    }

    .product-status-toggle__btn {
      min-width: 5.5rem;
      padding: 0.45rem 1.1rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.25rem;
      color: rgb(100 116 139);
      background: transparent;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }

    .product-status-toggle__btn:hover:not(.product-status-toggle__btn--active) {
      color: rgb(51 65 85);
    }

    :host-context(.dark) .product-status-toggle__btn {
      color: rgb(161 161 170);
    }

    :host-context(.dark) .product-status-toggle__btn:hover:not(.product-status-toggle__btn--active) {
      color: rgb(228 228 231);
    }

    .product-status-toggle__btn--active {
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
    }

    .product-status-toggle__btn--draft.product-status-toggle__btn--active {
      background: rgb(255 255 255);
      color: rgb(180 83 9);
    }

    .product-status-toggle__btn--live.product-status-toggle__btn--active {
      background: rgb(255 255 255);
      color: rgb(5 150 105);
    }

    :host-context(.dark) .product-status-toggle__btn--draft.product-status-toggle__btn--active {
      background: rgb(63 63 70);
      color: rgb(251 191 36);
    }

    :host-context(.dark) .product-status-toggle__btn--live.product-status-toggle__btn--active {
      background: rgb(63 63 70);
      color: rgb(52 211 153);
    }
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly descriptionPreview = computed((): SafeHtml => {
    const html = this.state.product()?.description ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly sectionIcon = Package;
  readonly ProductStatus = ProductStatus;
  readonly expanded = signal(true);
  readonly editing = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    categoryId: ['', Validators.required],
    brandId: [''],
    shortDescription: [''],
    description: [''],
    status: [ProductStatus.Active],
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
        status: ProductStatus.Active,
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
    const wasNew = this.state.isNew();
    const status = wasNew ? ProductStatus.Active : this.normalizeEditableStatus(v.status);
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
      status
    };

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
        this.notifications.errorFromApi(err, 'Could not save product details');
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
      status: this.normalizeEditableStatus(p.status),
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

  isStatusSelected(status: ProductStatus): boolean {
    return Number(this.form.controls.status.value) === status;
  }

  setStatus(status: ProductStatus): void {
    this.form.controls.status.setValue(status);
  }

  private normalizeEditableStatus(status: ProductStatus): ProductStatus {
    return status === ProductStatus.Active ? ProductStatus.Active : ProductStatus.Draft;
  }
}
