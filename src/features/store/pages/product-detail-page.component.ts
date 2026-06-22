import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoreContextService } from '../data-access/store-context.service';
import { ProductApiService } from '../data-access/product-api.service';
import { CartStateService } from '../data-access/cart-state.service';
import {
  CatalogProductDetailDto,
  CatalogProductListItemDto,
  catalogDiscountPercent,
  catalogInStock,
  catalogPrimaryImage
} from '@features/catalog/models/catalog-storefront.model';
import { variantLabel } from '../models/product.model';
import { ProductCardComponent } from '../commerce/product-card.component';
import { StarsRatingComponent } from '@shared/ui/stars-rating.component';
import { ProductReviewsSectionComponent } from '../commerce/product-reviews-section.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, StarsRatingComponent, ProductReviewsSectionComponent],
  template: `
    @if (loading()) {
      <div class="container mx-auto px-6 py-16">
        <div class="pf-glass-card h-96 animate-pulse rounded-xl"></div>
      </div>
    } @else if (!product()) {
      <div class="container mx-auto px-6 py-16 text-center">
        <h1 class="pf-heading text-2xl font-semibold">Product not found</h1>
        <a [routerLink]="['/store', ctx.slug(), 'products']" class="pf-btn-primary mt-6 inline-flex">Back to products</a>
      </div>
    } @else {
      @if (product(); as p) {
        <nav class="container mx-auto px-6 pt-8 text-sm text-[var(--text-muted)]">
          <a [routerLink]="['/store', ctx.slug()]" class="hover:underline">Home</a>
          <span class="mx-2">/</span>
          <a [routerLink]="['/store', ctx.slug(), 'products']" class="hover:underline">Shop</a>
          <span class="mx-2">/</span>
          <span>{{ p.categoryName }}</span>
          <span class="mx-2">/</span>
          <span class="text-[var(--text-primary)]">{{ p.name }}</span>
        </nav>

        <div class="container mx-auto grid gap-10 px-6 py-10 lg:grid-cols-2">
          <div class="space-y-4">
            <img [src]="activeImage()" [alt]="p.name" class="pf-glass-card w-full cursor-zoom-in rounded-xl object-cover transition hover:scale-[1.02]" />
            @if (p.images.length) {
              <div class="flex gap-3 overflow-x-auto">
                @for (img of p.images; track img.url) {
                  <button type="button" class="shrink-0" (click)="activeImage.set(img.url)">
                    <img [src]="img.url" alt="" class="h-16 w-16 rounded-lg object-cover ring-2 ring-transparent hover:ring-[var(--pf-accent)]" />
                  </button>
                }
              </div>
            }
          </div>
          <div>
            <p class="pf-text-muted text-sm">{{ p.brandName }} · {{ p.categoryName }}</p>
            <h1 class="pf-display pf-heading mt-2 text-3xl font-semibold">{{ p.name }}</h1>
            <div class="mt-4 flex items-baseline gap-3">
              <span class="text-2xl font-bold">{{ formatPrice(p.price) }}</span>
              @if (p.compareAtPrice && p.compareAtPrice > p.price) {
                <span class="pf-text-muted line-through">{{ formatPrice(p.compareAtPrice) }}</span>
                @if (discount(); as d) {
                  <span class="rounded-full bg-[var(--pf-accent)] px-2 py-0.5 text-xs font-bold text-white">-{{ d }}%</span>
                }
              }
            </div>
            <p class="pf-text-muted mt-2 text-sm" [class.text-emerald-600]="inStock()" [class.text-rose-600]="!inStock()">
              {{ inStock() ? 'In stock' : 'Out of stock' }}
            </p>

            @if (p.variants.length) {
              <div class="mt-6">
                <p class="pf-eyebrow mb-2">Variant</p>
                <div class="flex flex-wrap gap-2">
                  @for (v of p.variants; track v.id) {
                    <button
                      type="button"
                      class="pf-btn-secondary text-sm"
                      [class.ring-2]="selectedVariantId() === v.id"
                      [class.ring-[var(--pf-accent)]]="selectedVariantId() === v.id"
                      [disabled]="v.stockAvailable < 1"
                      (click)="selectedVariantId.set(v.id)"
                    >
                      {{ variantLabel(v) }}
                    </button>
                  }
                </div>
              </div>
            }

            <div class="mt-6 flex items-center gap-3">
              <span class="text-sm font-medium">Qty</span>
              <button type="button" class="admin-action-secondary rounded px-3 py-1" (click)="qty.set(Math.max(1, qty() - 1))">−</button>
              <span class="w-8 text-center">{{ qty() }}</span>
              <button type="button" class="admin-action-secondary rounded px-3 py-1" (click)="qty.set(qty() + 1)">+</button>
            </div>

            <button type="button" class="pf-btn-primary mt-6 w-full sm:w-auto" [disabled]="!inStock()" (click)="addToCart()">
              Add to cart
            </button>

            <div class="mt-8 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border p-3 text-sm">Free shipping on orders over $500</div>
              <div class="rounded-lg border p-3 text-sm">24-hour customer support</div>
              <div class="rounded-lg border p-3 text-sm">Easy 14-day returns</div>
              <div class="rounded-lg border p-3 text-sm">100% secure payments</div>
            </div>

            <div class="mox-tabs mt-8">
              <button type="button" class="mox-tabs__btn" [class.mox-tabs__btn--active]="detailTab() === 'description'" (click)="detailTab.set('description')">Description</button>
              <button type="button" class="mox-tabs__btn" [class.mox-tabs__btn--active]="detailTab() === 'specs'" (click)="detailTab.set('specs')">Specifications</button>
              <button type="button" class="mox-tabs__btn" [class.mox-tabs__btn--active]="detailTab() === 'reviews'" (click)="detailTab.set('reviews')">Reviews</button>
            </div>
            @if (detailTab() === 'description') {
              <p class="pf-text mt-4 leading-relaxed">{{ p.description }}</p>
            } @else if (detailTab() === 'specs') {
              <dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div class="mox-card p-3"><dt class="text-[var(--text-muted)]">SKU</dt><dd class="font-medium">{{ p.sku || '—' }}</dd></div>
                <div class="mox-card p-3"><dt class="text-[var(--text-muted)]">Brand</dt><dd class="font-medium">{{ p.brandName }}</dd></div>
                <div class="mox-card p-3"><dt class="text-[var(--text-muted)]">Category</dt><dd class="font-medium">{{ p.categoryName }}</dd></div>
                @if (p.tags.length) {
                  <div class="mox-card p-3"><dt class="text-[var(--text-muted)]">Tags</dt><dd class="font-medium">{{ p.tags.join(', ') }}</dd></div>
                }
              </dl>
            }

            <div class="mt-6 flex flex-wrap gap-2">
              <button type="button" class="admin-action-secondary rounded-lg px-3 py-1 text-sm" (click)="share('whatsapp')">WhatsApp</button>
              <button type="button" class="admin-action-secondary rounded-lg px-3 py-1 text-sm" (click)="copyLink()">Copy link</button>
            </div>
          </div>
        </div>

        @if (detailTab() === 'reviews') {
          <div class="container mx-auto px-6">
            <app-product-reviews-section [productId]="p.id" />
          </div>
        }

        <div class="mox-sticky-bar">
          <span class="flex-1 font-semibold">{{ formatPrice(p.price) }}</span>
          <button type="button" class="mox-btn mox-btn--primary flex-1" [disabled]="!inStock()" (click)="addToCart()">Add to cart</button>
        </div>

        @if (related().length) {
          <section class="container mx-auto px-6 pb-16">
            <h2 class="pf-heading mb-6 text-xl font-semibold">You might also like</h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              @for (item of related(); track item.id) {
                <app-product-card [product]="item" [storeSlug]="ctx.slug()" />
              }
            </div>
          </section>
        }
      }
    }
  `
})
export class ProductDetailPageComponent implements OnInit {
  readonly ctx = inject(StoreContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly productApi = inject(ProductApiService);
  private readonly cart = inject(CartStateService);
  readonly Math = Math;
  readonly variantLabel = variantLabel;

  readonly product = signal<CatalogProductDetailDto | null>(null);
  readonly related = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);
  readonly activeImage = signal('');
  readonly selectedVariantId = signal<string | undefined>(undefined);
  readonly qty = signal(1);
  readonly detailTab = signal<'description' | 'specs' | 'reviews'>('description');

  ngOnInit(): void {
    const productSlug = this.route.snapshot.paramMap.get('productSlug');
    if (!productSlug) {
      this.loading.set(false);
      return;
    }

    this.productApi.getBySlug(this.ctx.slug(), productSlug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
        if (p) {
          this.activeImage.set(catalogPrimaryImage(p));
          this.selectedVariantId.set(p.variants.find((v) => v.stockAvailable > 0)?.id);
          this.productApi.getRelated(this.ctx.slug(), p).subscribe((items) => this.related.set(items));
        }
      },
      error: () => this.loading.set(false)
    });
  }

  discount = () => {
    const p = this.product();
    return p ? catalogDiscountPercent(p) : null;
  };

  inStock = () => {
    const p = this.product();
    if (!p) return false;
    if (p.variants.length) {
      const v = p.variants.find((x) => x.id === this.selectedVariantId());
      return (v?.stockAvailable ?? 0) > 0;
    }
    return catalogInStock(p);
  };

  formatPrice(value: number): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.addProduct(p, this.qty(), this.selectedVariantId());
  }

  share(platform: string): void {
    const url = encodeURIComponent(window.location.href);
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${url}`, '_blank');
    }
  }

  copyLink(): void {
    void navigator.clipboard.writeText(window.location.href);
  }
}
