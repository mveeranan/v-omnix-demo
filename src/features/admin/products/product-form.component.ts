import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ProductAdminService } from './data-access/product-admin.service';
import { CategoryAdminService } from '../data-access/category-admin.service';
import { BrandAdminService } from '../data-access/brand-admin.service';
import { ProductCategoryDto } from '../models/product-category.model';
import { BrandDto } from '../models/brand.model';
import { StoreProduct, ProductVariant } from '../../store/models/product.model';
import { NotificationService } from '@core/notifications/notification.service';
import { categoryStore } from '../data-access/category.store';

type FormTab = 'basic' | 'pricing' | 'images' | 'variants' | 'inventory' | 'seo';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell [eyebrow]="isNew() ? 'New' : 'Edit'" [title]="isNew() ? 'Add product' : 'Edit product'" description="Product aggregate — category, pricing, images, variants, inventory, SEO.">
      @if (loading()) {
        <app-loading-spinner />
      } @else {
        @if (!categories().length) {
          <div class="mb-4 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm dark:bg-amber-500/10">
            No categories found. <a routerLink="/admin/categories" class="font-semibold underline">Create a category first</a>
          </div>
        }

        <div class="mb-4 flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
          @for (t of tabs; track t.id) {
            <button type="button" class="rounded-lg px-3 py-1.5 text-sm" [class.bg-[var(--accent-muted)]]="activeTab() === t.id" (click)="activeTab.set(t.id)">{{ t.label }}</button>
          }
        </div>

        <form [formGroup]="form" class="max-w-3xl space-y-6" (ngSubmit)="save()">
          @if (activeTab() === 'basic') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              <label class="block space-y-1"><span class="text-sm font-medium">Product name *</span><input class="pf-editor-input w-full" formControlName="name" /></label>
              <label class="block space-y-1"><span class="text-sm font-medium">Slug</span><input class="pf-editor-input w-full" formControlName="slug" /></label>
              <label class="block space-y-1"><span class="text-sm font-medium">SKU</span><input class="pf-editor-input w-full" formControlName="sku" /></label>
              <label class="block space-y-1"><span class="text-sm font-medium">Category *</span>
                <select class="pf-editor-input w-full" formControlName="categoryId">
                  <option value="">Select category</option>
                  @for (c of categories(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
                </select>
              </label>
              <label class="block space-y-1"><span class="text-sm font-medium">Brand</span>
                <select class="pf-editor-input w-full" formControlName="brandId">
                  <option value="">None</option>
                  @for (b of brands(); track b.id) { <option [value]="b.id">{{ b.name }}</option> }
                </select>
              </label>
              <label class="block space-y-1"><span class="text-sm font-medium">Short description</span><textarea class="pf-editor-input w-full" formControlName="shortDescription" rows="2"></textarea></label>
              <label class="block space-y-1"><span class="text-sm font-medium">Description</span><textarea class="pf-editor-input w-full min-h-[100px]" formControlName="description"></textarea></label>
              <label class="block space-y-1"><span class="text-sm font-medium">Status</span>
                <select class="pf-editor-input w-full" formControlName="status">
                  <option value="Draft">Draft</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Archived">Archived</option>
                </select>
              </label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="isPublished" /> Published</label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="isFeatured" /> Featured on homepage</label>
            </section>
          }

          @if (activeTab() === 'pricing') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              <div class="grid gap-4 sm:grid-cols-3">
                <label class="block space-y-1"><span class="text-sm font-medium">Price *</span><input class="pf-editor-input w-full" type="number" step="0.01" formControlName="price" /></label>
                <label class="block space-y-1"><span class="text-sm font-medium">Compare at</span><input class="pf-editor-input w-full" type="number" step="0.01" formControlName="compareAtPrice" /></label>
                <label class="block space-y-1"><span class="text-sm font-medium">Cost</span><input class="pf-editor-input w-full" type="number" step="0.01" formControlName="costPrice" /></label>
              </div>
              <label class="block space-y-1"><span class="text-sm font-medium">Weight (kg)</span><input class="pf-editor-input w-full" type="number" step="0.01" formControlName="weight" /></label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="trackInventory" /> Track inventory</label>
            </section>
          }

          @if (activeTab() === 'images') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              <label class="block space-y-1"><span class="text-sm font-medium">Primary image URL</span><input class="pf-editor-input w-full" formControlName="imageUrl" /></label>
              <label class="block space-y-1"><span class="text-sm font-medium">Gallery URLs (one per line)</span><textarea class="pf-editor-input w-full" formControlName="galleryText" rows="4"></textarea></label>
            </section>
          }

          @if (activeTab() === 'variants') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="hasVariants" /> This product has variants</label>
              @if (form.value.hasVariants) {
                <p class="text-sm text-[var(--text-secondary)]">Define size options (comma-separated):</p>
                <input class="pf-editor-input w-full" formControlName="variantSizes" placeholder="S, M, L, XL" />
              }
            </section>
          }

          @if (activeTab() === 'inventory') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              @if (!form.value.hasVariants) {
                <label class="block space-y-1"><span class="text-sm font-medium">Quantity available</span><input class="pf-editor-input w-full" type="number" formControlName="stockQuantity" /></label>
                <label class="block space-y-1"><span class="text-sm font-medium">Low stock threshold</span><input class="pf-editor-input w-full" type="number" formControlName="lowStockThreshold" /></label>
              } @else {
                <p class="text-sm text-[var(--text-secondary)]">Stock is managed per variant (generated on save).</p>
              }
            </section>
          }

          @if (activeTab() === 'seo') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              <p class="text-sm text-[var(--text-secondary)]">Preview: /store/my-store/products/{{ form.value.slug || 'product-slug' }}</p>
              <label class="block space-y-1"><span class="text-sm font-medium">Meta title</span><input class="pf-editor-input w-full" formControlName="metaTitle" /></label>
              <label class="block space-y-1"><span class="text-sm font-medium">Meta description</span><textarea class="pf-editor-input w-full" formControlName="metaDescription" rows="2"></textarea></label>
            </section>
          }

          <div class="flex flex-wrap gap-3">
            <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="form.invalid || saving() || !categories().length">{{ saving() ? 'Saving…' : 'Save product' }}</button>
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
  private readonly categoryApi = inject(CategoryAdminService);
  private readonly brandApi = inject(BrandAdminService);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isNew = signal(true);
  readonly categories = signal<ProductCategoryDto[]>([]);
  readonly brands = signal<BrandDto[]>([]);
  readonly activeTab = signal<FormTab>('basic');
  readonly tabs = [
    { id: 'basic' as const, label: 'Basic' },
    { id: 'pricing' as const, label: 'Pricing' },
    { id: 'images' as const, label: 'Images' },
    { id: 'variants' as const, label: 'Variants' },
    { id: 'inventory' as const, label: 'Inventory' },
    { id: 'seo' as const, label: 'SEO' }
  ];
  private productId = '';

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    slug: [''],
    sku: [''],
    categoryId: ['', Validators.required],
    brandId: [''],
    shortDescription: [''],
    description: ['', Validators.minLength(10)],
    status: ['Draft' as 'Draft' | 'Active' | 'Inactive' | 'Archived'],
    isPublished: [false],
    isFeatured: [false],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null],
    costPrice: [null as number | null],
    weight: [null as number | null],
    trackInventory: [true],
    imageUrl: [''],
    galleryText: [''],
    hasVariants: [false],
    variantSizes: [''],
    stockQuantity: [0, Validators.min(0)],
    lowStockThreshold: [5],
    metaTitle: [''],
    metaDescription: ['']
  });

  ngOnInit(): void {
    this.categoryApi.list().subscribe((c) => this.categories.set(c));
    this.brandApi.list().subscribe((b) => this.brands.set(b));
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
      slug: p.slug,
      sku: p.sku ?? '',
      categoryId: p.categoryId ?? categoryStore.getBySlug(p.category.toLowerCase())?.id ?? '',
      brandId: p.brandId ?? '',
      description: p.description,
      status: this.mapStatus(p.status),
      isPublished: p.status === 'active',
      isFeatured: p.featured,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      costPrice: p.costPrice ?? null,
      weight: p.dimensions?.weight ?? null,
      trackInventory: p.trackInventory ?? true,
      imageUrl: p.imageUrl,
      galleryText: p.galleryUrls.join('\n'),
      hasVariants: p.variants.length > 0,
      variantSizes: p.variants.map((v) => v.name).join(', '),
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold ?? 5,
      metaTitle: p.seo?.metaTitle ?? '',
      metaDescription: p.seo?.metaDescription ?? ''
    });
  }

  private mapStatus(s: StoreProduct['status']): 'Draft' | 'Active' | 'Inactive' | 'Archived' {
    const map: Record<string, 'Draft' | 'Active' | 'Inactive' | 'Archived'> = {
      draft: 'Draft',
      active: 'Active',
      inactive: 'Inactive',
      archived: 'Archived'
    };
    return map[s] ?? 'Draft';
  }

  private toStoreStatus(s: string): StoreProduct['status'] {
    return s.toLowerCase() as StoreProduct['status'];
  }

  save(): void {
    if (this.form.invalid || !this.categories().length) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const cat = categoryStore.getById(v.categoryId);
    const brand = v.brandId ? this.brands().find((b) => b.id === v.brandId) : null;
    const slug = v.slug.trim() || v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `product-${Date.now()}`;

    let variants: ProductVariant[] = [];
    if (v.hasVariants && v.variantSizes.trim()) {
      variants = v.variantSizes.split(',').map((size, i) => ({
        id: `v-${i}`,
        name: size.trim(),
        sku: `${v.sku || slug}-${size.trim()}`.replace(/\s+/g, ''),
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stockQuantity: Math.floor(v.stockQuantity / Math.max(1, v.variantSizes.split(',').length))
      })).filter((x) => x.name);
    }

    const product: StoreProduct = {
      id: this.productId || `p-${Date.now()}`,
      slug,
      name: v.name,
      sku: v.sku,
      description: v.description || v.shortDescription,
      category: cat?.name ?? '',
      categoryId: v.categoryId,
      brand: brand?.name ?? 'House Brand',
      brandId: v.brandId || null,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      costPrice: v.costPrice ?? undefined,
      currency: 'USD',
      imageUrl: v.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      galleryUrls: v.galleryText.split('\n').map((u) => u.trim()).filter(Boolean),
      stockQuantity: v.hasVariants ? variants.reduce((s, x) => s + x.stockQuantity, 0) : v.stockQuantity,
      status: v.isPublished ? 'active' : this.toStoreStatus(v.status),
      featured: v.isFeatured,
      trackInventory: v.trackInventory,
      lowStockThreshold: v.lowStockThreshold,
      variants,
      rating: 4.5,
      reviewCount: 0,
      dimensions: v.weight ? { weight: v.weight } : undefined,
      seo: {
        slug,
        metaTitle: v.metaTitle || v.name,
        metaDescription: v.metaDescription || v.shortDescription,
        keywords: []
      }
    };

    this.api.save(product).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Product saved');
        void this.router.navigate(['/admin/products']);
      },
      error: () => this.saving.set(false)
    });
  }
}
