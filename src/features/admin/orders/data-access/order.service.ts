import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  Order,
  OrderListFilters,
  OrderListResult,
  OrderNote,
  OrderStatus,
  PaymentMethod
} from '../models/order.model';

interface BackendOrderAddress {
  fullName: string;
  phone?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

interface BackendOrderItem {
  productId: string;
  variantId?: string | null;
  productName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BackendOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  grandTotal: number;
  currency: string;
  paymentMethod?: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
  customerId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: BackendOrderAddress | null;
  items: BackendOrderItem[];
}

interface BackendOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  currency: string;
  placedAt: string;
}

interface BackendOrderListResponse {
  items: BackendOrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
}

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  Stripe: 'card',
  PayPal: 'paypal',
  Razorpay: 'razorpay',
  Manual: 'wallet',
  UPI: 'upi',
  COD: 'cod'
};

function mapPaymentMethod(provider?: string | null): PaymentMethod {
  return (provider && PAYMENT_METHOD_MAP[provider]) || 'cod';
}

function mapSummaryToOrder(s: BackendOrderSummary): Order {
  return {
    id: s.id,
    orderNumber: s.orderNumber,
    storeSlug: '',
    customerName: s.customerName,
    customerEmail: s.customerEmail ?? '',
    customerPhone: '',
    shippingAddress: { name: s.customerName, email: s.customerEmail ?? '', phone: '', address: '', city: '', country: '' },
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: s.grandTotal,
    currency: s.currency,
    status: s.status.toLowerCase() as OrderStatus,
    paymentStatus: s.paymentStatus.toLowerCase() as Order['paymentStatus'],
    paymentMethod: 'cod',
    timeline: [],
    notes: [],
    createdAt: s.placedAt,
    updatedAt: s.placedAt
  };
}

function mapDetailToOrder(d: BackendOrderDetail): Order {
  const addr = d.shippingAddress;
  return {
    id: d.id,
    orderNumber: d.orderNumber,
    storeSlug: '',
    customerId: d.customerId ?? undefined,
    customerName: d.customerName ?? 'Guest',
    customerEmail: d.customerEmail ?? '',
    customerPhone: d.customerPhone ?? '',
    shippingAddress: {
      name: addr?.fullName ?? d.customerName ?? '',
      email: d.customerEmail ?? '',
      phone: addr?.phone ?? d.customerPhone ?? '',
      address: addr?.addressLine1 ?? '',
      addressLine2: addr?.addressLine2 ?? undefined,
      city: addr?.city ?? '',
      country: addr?.country ?? '',
      state: addr?.state ?? undefined,
      zip: addr?.postalCode ?? undefined
    },
    items: d.items.map((i) => ({
      productId: i.productId,
      productSlug: '',
      productName: i.productName ?? '',
      imageUrl: '',
      unitPrice: i.unitPrice,
      currency: d.currency,
      quantity: i.quantity,
      variantId: i.variantId ?? undefined,
      sku: i.sku ?? undefined,
      lineTotal: i.totalPrice
    })),
    subtotal: d.subtotal,
    shipping: d.shippingAmount,
    tax: d.taxAmount,
    discount: d.discountAmount,
    total: d.grandTotal,
    currency: d.currency,
    status: d.status.toLowerCase() as OrderStatus,
    paymentStatus: d.paymentStatus.toLowerCase() as Order['paymentStatus'],
    paymentMethod: mapPaymentMethod(d.paymentMethod),
    timeline: [
      { id: 'placed', label: 'Order placed', at: d.placedAt, completed: true },
      ...(d.status.toLowerCase() !== 'pending'
        ? [{ id: 'status', label: `Status: ${d.status}`, at: d.updatedAt, completed: true }]
        : [])
    ],
    notes: [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt
  };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  list(filters: OrderListFilters = {}): Observable<OrderListResult> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('pageSize', String(filters.pageSize ?? 25));
    if (filters.search) params = params.set('search', filters.search);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);

    return this.http
      .get<ApiResponse<BackendOrderListResponse>>(API_ENDPOINTS.orders.list, { params })
      .pipe(
        map((r) => {
          const data = r.data ?? { items: [], total: 0, page: 1, pageSize: 25, revenueThisMonth: 0, ordersThisMonth: 0 };
          return {
            items: data.items.map(mapSummaryToOrder),
            total: data.total,
            page: data.page,
            pageSize: data.pageSize,
            revenueThisMonth: data.revenueThisMonth,
            ordersThisMonth: data.ordersThisMonth
          };
        })
      );
  }

  getById(id: string): Observable<Order | null> {
    return this.http.get<ApiResponse<BackendOrderDetail>>(API_ENDPOINTS.orders.get(id)).pipe(
      map((r) => (r.data ? mapDetailToOrder(r.data) : null))
    );
  }

  /** TODO(Phase 5 — order lifecycle): no backend status-transition endpoint exists yet; updates locally only. */
  updateStatus(id: string, status: OrderStatus): Observable<Order | null> {
    return this.getById(id).pipe(map((o) => (o ? { ...o, status } : null)));
  }

  /** TODO(Phase 5 — order lifecycle): notes are not persisted to the backend yet. */
  addNote(id: string, text: string, author = 'Admin'): Observable<Order | null> {
    return this.getById(id).pipe(
      map((o) => {
        if (!o) return null;
        const note: OrderNote = { id: `n-${Date.now()}`, text, author, at: new Date().toISOString() };
        return { ...o, notes: [...o.notes, note] };
      })
    );
  }
}
