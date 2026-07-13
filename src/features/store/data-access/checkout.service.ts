import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SettingsService } from '../../admin/settings/data-access/settings.service';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { CartLineItem, CheckoutCustomer, CheckoutOrderResult, CheckoutPayload } from '../models/cart.model';
import { PaymentMethod } from '../../admin/orders/models/order.model';

export interface CheckoutFormData {
  customer: CheckoutCustomer & {
    firstName?: string;
    lastName?: string;
    state?: string;
    zip?: string;
    addressLine2?: string;
  };
  shippingMethod: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  billingSameAsShipping: boolean;
}

export interface ShippingOption {
  id: string;
  label: string;
  cost: number;
  days: string;
}

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

export interface PlaceOrderInput {
  storeSlug: string;
  email?: string;
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

  getShippingOptions(subtotal: number): Observable<ShippingOption[]> {
    return this.settingsService.getShipping().pipe(
      map((s) => {
        const options: ShippingOption[] = [
          { id: 'standard', label: 'Standard (3-5 days)', cost: s.defaultShippingCost, days: '3-5' },
          { id: 'express', label: 'Express (1-2 days)', cost: s.defaultShippingCost + 100, days: '1-2' }
        ];
        if (s.freeShippingEnabled && subtotal >= s.freeShippingThreshold) {
          return options.map((o) => ({ ...o, cost: o.id === 'standard' ? 0 : o.cost }));
        }
        return options;
      })
    );
  }

  calculateTax(subtotal: number): Observable<number> {
    return this.settingsService.getTax().pipe(
      map((t) => (t.calculateTax ? subtotal * (t.taxRate / 100) : 0))
    );
  }

  createOrder(
    payload: CheckoutPayload,
    extras: {
      shippingCost: number;
      tax: number;
      discount: number;
      paymentMethod: PaymentMethod;
      shippingMethod: string;
      couponCode?: string;
      customerFirstName?: string;
      customerLastName?: string;
      shippingState?: string;
      shippingZip?: string;
    }
  ): Observable<CheckoutOrderResult> {
    const grandTotal = payload.subtotal + extras.shippingCost + extras.tax - extras.discount;

    const body = {
      storeSlug: payload.storeSlug,
      firstName: extras.customerFirstName ?? payload.customer.name.split(' ')[0],
      lastName: extras.customerLastName ?? (payload.customer.name.split(' ').slice(1).join(' ') || ''),
      email: payload.customer.email,
      phone: payload.customer.phone,
      shippingAddress: payload.customer.address,
      shippingCity: payload.customer.city,
      shippingState: extras.shippingState,
      shippingZip: extras.shippingZip,
      shippingCountry: payload.customer.country,
      shippingMethod: extras.shippingMethod,
      paymentMethod: extras.paymentMethod,
      subtotal: payload.subtotal,
      taxAmount: extras.tax,
      discountAmount: extras.discount,
      shippingAmount: extras.shippingCost,
      grandTotal,
      couponCode: extras.couponCode || null,
      items: payload.items.map((line) => ({
        productId: line.productId,
        variantId: line.variantId ?? null,
        productName: line.productName,
        sku: null,
        quantity: line.quantity,
        unitPrice: line.unitPrice
      }))
    };

    return this.http
      .post<ApiResponse<{ orderId: string; orderNumber: string; grandTotal: number; status: string }>>(
        API_ENDPOINTS.orders.create,
        body
      )
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message ?? 'Could not place order.');
          return {
            orderId: r.data.orderId,
            orderNumber: r.data.orderNumber,
            status: r.data.status
          };
        })
      );
  }
}
