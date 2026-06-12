import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '../../../shared/ui/loading-spinner.component';
import { ProductAdminService } from './data-access/product-admin.service';
import { StoreProduct } from '../../store/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell [eyebrow]="isNew() ? 'New' : 'Edit'" [title]="isNew() ? 'Add product' : 'Edit product'" description="Basic product information, pricing, and inventory.">
      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <form [formGroup]="form" class="max-w-3xl space-y-6" (ngSubmit)="save()">
          <section class="admin-glass-card space-y-4 rounded-xl p-6">
            <h2 class="font-semibold">Basic information</h2>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Product name</span>
              <input class="pf-editor-input w-full" formControlName="name" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">SKU</span>
              <input class="pf-editor-input w-full" formControlName="sku" />
            </label>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Description</span>
              <textarea class="pf-editor-input w-full min-h-[100px]" formControlName="description"></textarea>
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Category</span>
                <input class="pf-editor-input w-full" formControlName="category" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Brand</span>
                <input class="pf-editor-input w-full" formControlName="brand" />
              </label>
            </div>
          </section>

          <section class="admin-glass-card space-y-4 rounded-xl p-6">
            <h2 class="font-semibold">Pricing & inventory</h2>
            <div class="grid gap-4 sm:grid-cols-3">
              <label class="block space-y-1">
                <span class="text-sm font-medium">Price</span>
                <input class="pf-editor-input w-full" type="number" step="0.01" formControlName="price" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Sale price</span>
                <input class="pf-editor-input w-full" type="number" step="0.01" formControlName="compareAtPrice" />
              </label>
              <label class="block space-y-1">
                <span class="text-sm font-medium">Stock</span>
                <input class="pf-editor-input w-full" type="number" formControlName="stockQuantity" />
              </label>
            </div>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Status</span>
              <select class="pf-editor-input w-full" formControlName="status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" formControlName="featured" />
              Featured on homepage
            </label>
          </section>

          <section class="admin-glass-card space-y-4 rounded-xl p-6">
            <h2 class="font-semibold">Images</h2>
            <label class="block space-y-1">
              <span class="text-sm font-medium">Main image URL</span>
              <input class="pf-editor-input w-full" formControlName="imageUrl" />
            </label>
          </section>

          <div class="flex flex-wrap gap-3">
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Save product' }}
            </button>
            <a routerLink="/admin/products" class="admin-action-secondary rounded-lg px-4 py-2 text-sm">Cancel</a>
          </div>
        </form>
      }
    </app-admin-page-shell>
  `
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductAdminService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isNew = signal(true);
  private productId = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: [''],
    description: ['', Validators.minLength(10)],
    category: ['', Validators.required],
    brand: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null],
    stockQuantity: [0, Validators.min(0)],
    status: ['draft' as StoreProduct['status']],
    featured: [false],
    imageUrl: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNew.set(false);
      this.productId = id;
      this.loading.set(true);
      this.api.getById(id).subscribe({
        next: (p) => {
          if (p) this.patchForm(p);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  private patchForm(p: StoreProduct): void {
    this.form.patchValue({
      name: p.name,
      sku: p.sku ?? '',
      description: p.description,
      category: p.category,
      brand: p.brand,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stockQuantity: p.stockQuantity,
      status: p.status,
      featured: p.featured,
      imageUrl: p.imageUrl
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.getRawValue();
    const slug =
      v.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `product-${Date.now()}`;

    const product: StoreProduct = {
      id: this.productId || `p-${Date.now()}`,
      slug,
      name: v.name,
      sku: v.sku,
      description: v.description,
      category: v.category,
      brand: v.brand || 'House Brand',
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      currency: 'USD',
      imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      galleryUrls: v.imageUrl ? [v.imageUrl] : [],
      stockQuantity: v.stockQuantity,
      status: v.status,
      featured: v.featured,
      variants: [],
      rating: 4.5,
      reviewCount: 0
    };

    this.api.save(product).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/admin/products']);
      },
      error: () => this.saving.set(false)
    });
  }
}
