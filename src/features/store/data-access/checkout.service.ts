import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SettingsService } from '../../admin/settings/data-access/settings.service';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { PaymentMethod } from '../../admin/orders/models/order.model';

export interface CouponValidation {
  valid: boolean;
  discountType?: string;
  discountValue?: number;
  maximumDiscountAmount?: number;
  message?: string;
}

/** Mirrors backend PaymentProviderType enum (WorkOrbit.Application.Contracts.Services). */
export enum PaymentProviderType {
  Stripe = 1,
  Razorpay = 2,
  PayPal = 3,
  UPI = 4,
  COD = 5
}

/** Maps a storefront payment-method string to the backend provider enum. */
export function toPaymentProviderType(method: PaymentMethod): PaymentProviderType {
  switch (method) {
    case 'card': return PaymentProviderType.Stripe;
    case 'razorpay': return PaymentProviderType.Razorpay;
    case 'upi': return PaymentProviderType.UPI;
    case 'cod': return PaymentProviderType.COD;
    default: return PaymentProviderType.COD;
  }
}

export interface CheckoutLineRequest {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  variantId?: string | null;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

/** Server-authoritative price breakdown returned by /checkout/quote. */
export interface CheckoutQuote {
  lines: PricedLine[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  warnings: string[];
}

export interface InitiatePaymentResponse {
  providerPaymentId: string;
  clientSecret: string;
  publicKey: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  status: string;
  quote: CheckoutQuote;
  payment: InitiatePaymentResponse | null;
  requiresPaymentAction: boolean;
}

export interface CheckoutAddressInput {
  firstName?: string;
  lastName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

export interface MyOrderItem {
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** One row of the logged-in customer's order history (see getMyOrders). */
export interface MyOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  currency: string;
  placedAt: string;
  items: MyOrderItem[];
}

export interface MyCheckoutAddress {
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  countryIsoCode?: string;
}

/** Saved checkout details for a logged-in customer (see getMyCheckoutProfile). */
export interface MyCheckoutProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  hasSavedAddress: boolean;
  address?: MyCheckoutAddress | null;
}

export interface PlaceOrderInput {
  storeSlug: string;
  email?: string;
  /** Required for a new account unless the customer is already logged in (see StoreAuthService). */
  password?: string;
  shippingAddress: CheckoutAddressInput;
  shippingZoneId?: string | null;
  paymentProvider: PaymentProviderType;
  couponCode?: string | null;
  items: CheckoutLineRequest[];
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly settingsService = inject(SettingsService);

  /**
   * Fetches a server-authoritative price quote (subtotal/shipping/tax/total).
   * Prices are recomputed on the backend from the catalog — client prices are ignored.
   */
  getQuote(
    storeSlug: string,
    items: CheckoutLineRequest[],
    shippingZoneId?: string | null
  ): Observable<CheckoutQuote> {
    return this.http
      .post<ApiResponse<CheckoutQuote>>(API_ENDPOINTS.checkout.quote, {
        storeSlug,
        shippingZoneId: shippingZoneId ?? null,
        items
      })
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message ?? 'Could not calculate totals.');
          return r.data;
        })
      );
  }

  /**
   * Places the order via the server-authoritative endpoint. The backend recomputes all
   * totals, creates the order, and (for online providers) returns payment initiation data.
   */
  placeOrder(input: PlaceOrderInput): Observable<CheckoutResult> {
    return this.http
      .post<ApiResponse<CheckoutResult>>(API_ENDPOINTS.checkout.placeOrder, input)
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message ?? 'Could not place order.');
          return r.data;
        })
      );
  }

  /**
   * The logged-in customer's own order history for this store. Requires the storefront
   * customer token (attached automatically by the auth interceptor for /checkout/ URLs).
   */
  getMyOrders(storeSlug: string): Observable<MyOrder[]> {
    return this.http
      .get<ApiResponse<MyOrder[]>>(API_ENDPOINTS.checkout.myOrders, { params: { storeSlug } })
      .pipe(
        map((r) => {
          if (!r.success) throw new Error(r.message ?? 'Could not load your orders.');
          return r.data ?? [];
        })
      );
  }

  /**
   * Saved checkout details (contact + default shipping address) for the logged-in customer on
   * this store. Lets the checkout page skip the address form for returning customers.
   */
  getMyCheckoutProfile(storeSlug: string): Observable<MyCheckoutProfile> {
    return this.http
      .get<ApiResponse<MyCheckoutProfile>>(API_ENDPOINTS.checkout.myProfile, { params: { storeSlug } })
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message ?? 'Could not load your details.');
          return r.data;
        })
      );
  }

  validateCoupon(storeSlug: string, code: string, orderSubtotal: number): Observable<CouponValidation> {
    return this.http
      .post<ApiResponse<CouponValidation>>(API_ENDPOINTS.coupons.validate, {
        storeSlug,
        code: code.trim(),
        orderSubtotal
      })
      .pipe(map((r) => r.data ?? { valid: false, message: r.message ?? 'Invalid coupon.' }));
  }

  /** Real shipping zones from store settings; falls back to a single default option. */
  getShippingZones(): Observable<{ id: string | null; label: string; cost: number }[]> {
    return this.settingsService.getShipping().pipe(
      map((s) => {
        const zones = (s.zones ?? []).map((z) => ({
          id: z.id ?? null,
          label: z.name ?? 'Zone',
          cost: z.baseCost
        }));
        return zones.length
          ? zones
          : [{ id: null, label: 'Standard shipping', cost: s.defaultShippingCost }];
      })
    );
  }

}
