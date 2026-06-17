import { Injectable, computed, signal } from '@angular/core';
import { CartLineItem, CartSummary, CheckoutOrderResult, CheckoutPayload } from '../models/cart.model';
import { StoreProduct } from '../models/product.model';
import { Observable, of, delay } from 'rxjs';

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

  addProduct(product: StoreProduct, quantity = 1, variantId?: string): void {
    const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
    const unitPrice = variant?.price ?? product.price;
    const existing = this.items().find(
      (line) =>
        line.productId === product.id &&
        (line.variantId ?? '') === (variantId ?? '')
    );

    if (existing) {
      this.updateQuantity(existing.productId, existing.quantity + quantity, existing.variantId);
      return;
    }

    const line: CartLineItem = {
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: product.imageUrl,
      unitPrice,
      currency: product.currency,
      quantity,
      variantId: variant?.id,
      variantName: variant?.name
    };

    this.items.update((lines) => [...lines, line]);
    this.persist();
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

  submitOrder(payload: CheckoutPayload): Observable<CheckoutOrderResult> {
    return of({
      orderId: `ord-${Date.now()}`,
      orderNumber: `WO-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'pending'
    }).pipe(delay(600));
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
