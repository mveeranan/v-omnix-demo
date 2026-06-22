import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { ProductAdminService } from './data-access/product-admin.service';
import { CategoryAdminService } from '../data-access/category-admin.service';
import { BrandAdminService } from '../data-access/brand-admin.service';
import { ProductTagApiService } from '@features/catalog/data-access/product-tag-api.service';
import { ProductAttributeApiService } from '@features/catalog/data-access/product-attribute-api.service';
import { ProductCategoryDto, flattenCategories } from '@features/catalog/models/product-category.model';
import { BrandDto } from '@features/catalog/models/brand.model';
import { ProductTagDto } from '@features/catalog/models/product-tag.model';
import { ProductAttributeDto } from '@features/catalog/models/product-attribute.model';
import {
  PendingImageUpload,
  ProductDetailDto,
  ProductSavePayload,
  SaveProductImageItem,
  SaveProductVariantItem
} from '@features/catalog/models/product-admin.model';
import { ProductStatus } from '@features/catalog/models/product-status.enum';
import { NotificationService } from '@core/notifications/notification.service';
import { AuthService } from '@core/auth/auth.service';
import { requireTenantId } from '@features/catalog/data-access/catalog-api.util';

type FormTab = 'basic' | 'pricing' | 'images' | 'variants' | 'inventory' | 'seo';

interface VariantRow {
  id: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  barcode: string;
  weight: number | null;
  isActive: boolean;
  attributeSelections: Record<string, string>;
  quantityAvailable: number;
  lowStockThreshold: number;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, AdminPageShellComponent, LoadingSpinnerComponent],
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
                  <option [ngValue]="1">Draft</option>
                  <option [ngValue]="2">Active</option>
                  <option [ngValue]="3">Inactive</option>
                  <option [ngValue]="4">Archived</option>
                </select>
              </label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="publishOnSave" /> Publish (set Active) on save</label>
              <div class="space-y-2">
                <span class="text-sm font-medium">Tags</span>
                <div class="flex flex-wrap gap-2">
                  @for (tag of tags(); track tag.id) {
                    <label class="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-sm">
                      <input type="checkbox" [checked]="selectedTagIds().has(tag.id)" (change)="toggleTag(tag.id)" />
                      {{ tag.name }}
                    </label>
                  }
                  @if (!tags().length) {
                    <p class="text-sm text-[var(--text-muted)]">No tags yet. <a routerLink="/admin/product-tags" class="underline">Create tags</a></p>
                  }
                </div>
              </div>
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
              <label class="block space-y-1">
                <span class="text-sm font-medium">Upload images</span>
                <input type="file" accept="image/*" multiple class="pf-editor-input w-full" (change)="onFilesSelected($event)" />
              </label>
              @if (existingImages().length) {
                <div class="space-y-2">
                  <p class="text-sm font-medium">Existing images</p>
                  @for (img of existingImages(); track img.id ?? img.documentId) {
                    <div class="flex items-center gap-3 rounded-lg border border-[var(--border)] p-2">
                      <img [src]="img.url || ''" alt="" class="h-12 w-12 rounded object-cover" />
                      <span class="flex-1 text-sm">{{ img.altText || 'Image' }}</span>
                      <label class="text-xs"><input type="radio" name="primary" [checked]="img.isPrimary" (change)="setPrimaryExisting(img)" /> Primary</label>
                    </div>
                  }
                </div>
              }
              @if (pendingImages().length) {
                <div class="space-y-2">
                  <p class="text-sm font-medium">Pending uploads</p>
                  @for (img of pendingImages(); track $index) {
                    <div class="flex items-center gap-3 rounded-lg border border-[var(--border)] p-2">
                      <span class="flex-1 truncate text-sm">{{ img.file.name }}</span>
                      <label class="text-xs"><input type="radio" name="primaryPending" [checked]="img.isPrimary" (change)="setPrimaryPending($index)" /> Primary</label>
                      <button type="button" class="text-rose-600 text-xs" (click)="removePending($index)">Remove</button>
                    </div>
                  }
                </div>
              }
            </section>
          }

          @if (activeTab() === 'variants') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="hasVariants" (change)="onVariantsToggle()" /> This product has variants</label>
              @if (form.value.hasVariants) {
                @if (!attributes().length) {
                  <p class="text-sm text-[var(--text-muted)]">Define attributes first. <a routerLink="/admin/product-attributes" class="underline">Manage attributes</a></p>
                } @else {
                  <div class="space-y-3">
                    <p class="text-sm font-medium">Select attributes for variants</p>
                    @for (attr of attributes(); track attr.id) {
                      <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" [checked]="selectedAttributeIds().has(attr.id)" (change)="toggleAttribute(attr.id)" />
                        {{ attr.name }} ({{ attr.values.length }} values)
                      </label>
                    }
                    <button type="button" class="admin-action-secondary rounded-lg px-3 py-1.5 text-sm" (click)="generateVariants()">Generate variant combinations</button>
                  </div>
                  @if (variantRows().length) {
                    <div class="overflow-x-auto">
                      <table class="w-full text-left text-sm">
                        <thead>
                          <tr class="border-b">
                            <th class="p-2">SKU</th>
                            <th class="p-2">Price</th>
                            <th class="p-2">Attributes</th>
                            <th class="p-2">Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (row of variantRows(); track $index) {
                            <tr class="border-b">
                              <td class="p-2"><input class="pf-editor-input w-full text-xs" [(ngModel)]="row.sku" [ngModelOptions]="{standalone: true}" /></td>
                              <td class="p-2"><input class="pf-editor-input w-20 text-xs" type="number" [(ngModel)]="row.price" [ngModelOptions]="{standalone: true}" /></td>
                              <td class="p-2 text-xs">{{ variantLabel(row) }}</td>
                              <td class="p-2"><input type="checkbox" [(ngModel)]="row.isActive" [ngModelOptions]="{standalone: true}" /></td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
                }
              }
            </section>
          }

          @if (activeTab() === 'inventory') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
              @if (!form.value.trackInventory) {
                <p class="text-sm text-[var(--text-muted)]">Inventory tracking is disabled for this product.</p>
              } @else if (!form.value.hasVariants) {
                <label class="block space-y-1"><span class="text-sm font-medium">Quantity available</span><input class="pf-editor-input w-full" type="number" formControlName="stockQuantity" /></label>
                <label class="block space-y-1"><span class="text-sm font-medium">Low stock threshold</span><input class="pf-editor-input w-full" type="number" formControlName="lowStockThreshold" /></label>
              } @else {
                @for (row of variantRows(); track $index) {
                  <div class="grid gap-3 sm:grid-cols-3 rounded-lg border border-[var(--border)] p-3">
                    <span class="text-sm font-medium sm:col-span-3">{{ variantLabel(row) }}</span>
                    <label class="block space-y-1"><span class="text-xs">Qty</span><input class="pf-editor-input w-full" type="number" [(ngModel)]="row.quantityAvailable" [ngModelOptions]="{standalone: true}" /></label>
                    <label class="block space-y-1"><span class="text-xs">Low stock</span><input class="pf-editor-input w-full" type="number" [(ngModel)]="row.lowStockThreshold" [ngModelOptions]="{standalone: true}" /></label>
                  </div>
                }
              }
            </section>
          }

          @if (activeTab() === 'seo') {
            <section class="admin-glass-card space-y-4 rounded-xl p-6">
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
  private readonly tagApi = inject(ProductTagApiService);
  private readonly attributeApi = inject(ProductAttributeApiService);
  private readonly notifications = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isNew = signal(true);
  readonly categories = signal<ProductCategoryDto[]>([]);
  readonly brands = signal<BrandDto[]>([]);
  readonly tags = signal<ProductTagDto[]>([]);
  readonly attributes = signal<ProductAttributeDto[]>([]);
  readonly selectedTagIds = signal(new Set<string>());
  readonly selectedAttributeIds = signal(new Set<string>());
  readonly existingImages = signal<(SaveProductImageItem & { url?: string })[]>([]);
  readonly pendingImages = signal<PendingImageUpload[]>([]);
  readonly variantRows = signal<VariantRow[]>([]);
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
    categoryId: ['', Validators.required],
    brandId: [''],
    shortDescription: [''],
    description: [''],
    status: [ProductStatus.Draft as ProductStatus],
    publishOnSave: [false],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null as number | null],
    costPrice: [null as number | null],
    weight: [null as number | null],
    trackInventory: [true],
    hasVariants: [false],
    stockQuantity: [0, Validators.min(0)],
    lowStockThreshold: [5],
    metaTitle: [''],
    metaDescription: ['']
  });

  ngOnInit(): void {
    this.categoryApi.listFlat().subscribe((c) => this.categories.set(c));
    this.brandApi.list().subscribe((b) => this.brands.set(b));
    this.tagApi.list().subscribe((t) => this.tags.set(t));
    this.attributeApi.list().subscribe((a) => this.attributes.set(a));

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

  private patchForm(p: ProductDetailDto): void {
    this.form.patchValue({
      name: p.name,
      categoryId: p.categoryId,
      brandId: p.brandId ?? '',
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? '',
      status: p.status,
      publishOnSave: p.status === ProductStatus.Active,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      costPrice: p.costPrice,
      weight: p.weight,
      trackInventory: p.trackInventory,
      hasVariants: p.variants.length > 0,
      stockQuantity: p.inventory.find((i) => !i.variantId)?.quantityAvailable ?? 0,
      lowStockThreshold: p.inventory.find((i) => !i.variantId)?.lowStockThreshold ?? 5,
      metaTitle: p.metaTitle ?? '',
      metaDescription: p.metaDescription ?? ''
    });
    this.selectedTagIds.set(new Set(p.tagIds));
    this.existingImages.set(
      p.images.map((img) => ({
        id: img.id,
        documentId: img.documentId,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
        url: img.url
      }))
    );
    if (p.variants.length) {
      const attrIds = new Set<string>();
      p.variants.forEach((v) => v.attributes.forEach((a) => attrIds.add(a.attributeId)));
      this.selectedAttributeIds.set(attrIds);
      this.variantRows.set(
        p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          barcode: v.barcode ?? '',
          weight: v.weight,
          isActive: v.isActive,
          attributeSelections: Object.fromEntries(
            v.attributes.map((a) => [a.attributeId, a.valueId])
          ),
          quantityAvailable:
            p.inventory.find((i) => i.variantId === v.id)?.quantityAvailable ?? 0,
          lowStockThreshold:
            p.inventory.find((i) => i.variantId === v.id)?.lowStockThreshold ?? 5
        }))
      );
    }
  }

  toggleTag(id: string): void {
    const next = new Set(this.selectedTagIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedTagIds.set(next);
  }

  toggleAttribute(id: string): void {
    const next = new Set(this.selectedAttributeIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedAttributeIds.set(next);
  }

  onVariantsToggle(): void {
    if (!this.form.value.hasVariants) {
      this.variantRows.set([]);
      this.selectedAttributeIds.set(new Set());
    }
  }

  generateVariants(): void {
    const selected = this.attributes().filter((a) => this.selectedAttributeIds().has(a.id));
    if (!selected.length) return;

    const combos: Record<string, string>[] = [{}];
    for (const attr of selected) {
      const next: Record<string, string>[] = [];
      for (const combo of combos) {
        for (const val of attr.values) {
          next.push({ ...combo, [attr.id]: val.id });
        }
      }
      combos.splice(0, combos.length, ...next);
    }

    const v = this.form.getRawValue();
    this.variantRows.set(
      combos.map((combo, i) => ({
        id: null,
        sku: `variant-${i + 1}`,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        barcode: '',
        weight: v.weight,
        isActive: true,
        attributeSelections: combo,
        quantityAvailable: 0,
        lowStockThreshold: 5
      }))
    );
  }

  variantLabel(row: VariantRow): string {
    return Object.entries(row.attributeSelections)
      .map(([attrId, valId]) => {
        const attr = this.attributes().find((a) => a.id === attrId);
        const val = attr?.values.find((v) => v.id === valId);
        return val ? `${attr?.name}: ${val.value}` : '';
      })
      .filter(Boolean)
      .join(', ');
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const startOrder = this.existingImages().length + this.pendingImages().length;
    const newPending: PendingImageUpload[] = files.map((file, i) => ({
      file,
      altText: file.name,
      sortOrder: startOrder + i,
      isPrimary: this.existingImages().length === 0 && this.pendingImages().length === 0 && i === 0
    }));
    this.pendingImages.update((prev) => [...prev, ...newPending]);
    input.value = '';
  }

  setPrimaryExisting(img: SaveProductImageItem & { url?: string }): void {
    this.existingImages.update((items) =>
      items.map((i) => ({ ...i, isPrimary: i.documentId === img.documentId }))
    );
    this.pendingImages.update((items) => items.map((i) => ({ ...i, isPrimary: false })));
  }

  setPrimaryPending(index: number): void {
    this.pendingImages.update((items) =>
      items.map((i, idx) => ({ ...i, isPrimary: idx === index }))
    );
    this.existingImages.update((items) => items.map((i) => ({ ...i, isPrimary: false })));
  }

  removePending(index: number): void {
    this.pendingImages.update((items) => items.filter((_, i) => i !== index));
  }

  save(): void {
    if (this.form.invalid || !this.categories().length) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const tenantId = requireTenantId(this.auth);

    const variants: SaveProductVariantItem[] = this.variantRows().map((row) => ({
      id: row.id,
      sku: row.sku,
      price: row.price,
      compareAtPrice: row.compareAtPrice,
      barcode: row.barcode || null,
      weight: row.weight,
      isActive: row.isActive,
      attributes: Object.entries(row.attributeSelections).map(([attributeId, valueId]) => ({
        attributeId,
        valueId
      }))
    }));

    let inventory: ProductSavePayload['inventory'] = [];
    if (v.trackInventory) {
      if (v.hasVariants && this.variantRows().length) {
        inventory = this.variantRows().map((row) => ({
          variantId: row.id,
          quantityAvailable: row.quantityAvailable,
          lowStockThreshold: row.lowStockThreshold
        }));
      } else {
        inventory = [
          {
            variantId: null,
            quantityAvailable: v.stockQuantity,
            lowStockThreshold: v.lowStockThreshold
          }
        ];
      }
    }

    const payload: ProductSavePayload = {
      productId: this.productId || undefined,
      core: {
        tenantId,
        categoryId: v.categoryId,
        brandId: v.brandId || null,
        name: v.name,
        shortDescription: v.shortDescription || null,
        description: v.description || null,
        metaTitle: v.metaTitle || null,
        metaDescription: v.metaDescription || null,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        costPrice: v.costPrice,
        weight: v.weight,
        trackInventory: v.trackInventory,
        status: v.publishOnSave ? ProductStatus.Draft : v.status
      },
      selectedAttributeIds: [...this.selectedAttributeIds()],
      variants: v.hasVariants ? variants : [],
      existingImages: this.existingImages().map(({ id, documentId, altText, sortOrder, isPrimary }) => ({
        id,
        documentId,
        altText,
        sortOrder,
        isPrimary
      })),
      pendingImages: this.pendingImages(),
      inventory,
      tagIds: [...this.selectedTagIds()],
      publish: v.publishOnSave
    };

    this.api.save(payload).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.productId = saved.id;
        this.isNew.set(false);
        this.pendingImages.set([]);
        this.notifications.success('Product saved');
        void this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.saving.set(false);
        this.notifications.error(err?.message ?? 'Could not save product');
      }
    });
  }
}
