import { Injectable, computed, signal } from '@angular/core';
import { CartLineItem, CartSummary } from '../models/cart.model';
import {
  CatalogProductDetailDto,
  CatalogProductListItemDto
} from '@features/catalog/models/catalog-storefront.model';
import { catalogPrimaryImage, variantLabel } from '../models/product.model';

const STORAGE_KEY = 'work-orbit.cart';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private readonly items = signal<CartLineItem[]>(this.loadFromStorage());
  readonly storeSlug = signal<string | null>(null);

  readonly lineItems = this.items.asReadonly();

  readonly summary = computed<CartSummary>(() => {
    const lines = this.items();
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const currency = lines[0]?.currency ?? 'USD';
    return { itemCount, subtotal, currency };
  });

  setStoreSlug(slug: string): void {
    this.storeSlug.set(slug);
  }

  addListItem(product: CatalogProductListItemDto, quantity = 1): void {
    this.addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: catalogPrimaryImage(product),
      unitPrice: product.price,
      currency: 'USD',
      quantity,
      variantId: undefined,
      variantName: undefined
    });
  }

  addProduct(product: CatalogProductDetailDto, quantity = 1, variantId?: string): void {
    const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
    const unitPrice = variant?.price ?? product.price;
    this.addLine({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: catalogPrimaryImage(product),
      unitPrice,
      currency: 'USD',
      quantity,
      variantId: variant?.id,
      variantName: variant ? variantLabel(variant) : undefined
    });
  }

  updateQuantity(productId: string, quantity: number, variantId?: string): void {
    if (quantity < 1) {
      this.removeItem(productId, variantId);
      return;
    }
    this.items.update((lines) =>
      lines.map((line) =>
        line.productId === productId && (line.variantId ?? '') === (variantId ?? '')
          ? { ...line, quantity }
          : line
      )
    );
    this.persist();
  }

  removeItem(productId: string, variantId?: string): void {
    this.items.update((lines) =>
      lines.filter(
        (line) =>
          !(line.productId === productId && (line.variantId ?? '') === (variantId ?? ''))
      )
    );
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  private addLine(line: CartLineItem): void {
    const existing = this.items().find(
      (l) =>
        l.productId === line.productId &&
        (l.variantId ?? '') === (line.variantId ?? '')
    );

    if (existing) {
      this.updateQuantity(existing.productId, existing.quantity + line.quantity, existing.variantId);
      return;
    }

    this.items.update((lines) => [...lines, line]);
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
    } catch {
      /* ignore */
    }
  }

  private loadFromStorage(): CartLineItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartLineItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
