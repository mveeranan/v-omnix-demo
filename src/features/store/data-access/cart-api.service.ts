import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { CartLineItem, CartSummary } from '../models/cart.model';

interface CartItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantName?: string;
}

interface CartItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  currency: string;
}

interface CartResponse {
  id: string;
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);

  getCart(): Observable<{ lineItems: CartLineItem[]; summary: CartSummary }> {
    return this.http.get<ApiResponse<CartResponse>>(API_ENDPOINTS.cart.get).pipe(
      map(response => {
        const cart = response.data;
        const lineItems: CartLineItem[] = cart.items.map(item => ({
          productId: item.productId,
          productSlug: item.productSlug,
          productName: item.productName,
          imageUrl: item.imageUrl,
          unitPrice: item.unitPrice,
          currency: item.currency,
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName
        }));

        const summary: CartSummary = {
          itemCount: cart.itemCount,
          subtotal: cart.subtotal,
          currency: cart.currency
        };

        return { lineItems, summary };
      })
    );
  }

  addItem(
    productId: string,
    productName: string,
    productSlug: string,
    imageUrl: string,
    unitPrice: number,
    quantity: number,
    variantId?: string,
    variantName?: string
  ): Observable<CartLineItem[]> {
    const payload: CartItemRequest = {
      productId,
      variantId,
      quantity,
      unitPrice,
      productName,
      productSlug,
      imageUrl,
      variantName
    };

    return this.http.post<ApiResponse<CartResponse>>(API_ENDPOINTS.cart.addItem, payload).pipe(
      map(response =>
        response.data.items.map(item => ({
          productId: item.productId,
          productSlug: item.productSlug,
          productName: item.productName,
          imageUrl: item.imageUrl,
          unitPrice: item.unitPrice,
          currency: item.currency,
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName
        }))
      )
    );
  }

  updateQuantity(productId: string, variantId: string | undefined, quantity: number): Observable<CartLineItem[]> {
    const payload = { quantity };
    return this.http
      .put<ApiResponse<CartResponse>>(API_ENDPOINTS.cart.updateItem(productId), payload)
      .pipe(
        map(response =>
          response.data.items.map(item => ({
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            imageUrl: item.imageUrl,
            unitPrice: item.unitPrice,
            currency: item.currency,
            quantity: item.quantity,
            variantId: item.variantId,
            variantName: item.variantName
          }))
        )
      );
  }

  removeItem(productId: string, variantId?: string): Observable<CartLineItem[]> {
    return this.http
      .delete<ApiResponse<CartResponse>>(API_ENDPOINTS.cart.removeItem(productId), {
        body: { variantId }
      })
      .pipe(
        map(response =>
          response.data.items.map(item => ({
            productId: item.productId,
            productSlug: item.productSlug,
            productName: item.productName,
            imageUrl: item.imageUrl,
            unitPrice: item.unitPrice,
            currency: item.currency,
            quantity: item.quantity,
            variantId: item.variantId,
            variantName: item.variantName
          }))
        )
      );
  }

  clearCart(): Observable<void> {
    return this.http.delete<ApiResponse<string>>(API_ENDPOINTS.cart.clear).pipe(map(() => undefined));
  }
}
