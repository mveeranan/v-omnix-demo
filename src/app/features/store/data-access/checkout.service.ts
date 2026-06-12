import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map, switchMap } from 'rxjs';
import { OrderService } from '../../admin/orders/data-access/order.service';
import { Order, OrderLineItem, PaymentMethod } from '../../admin/orders/models/order.model';
import { PaymentService } from '../../admin/payments/data-access/payment.service';
import { SettingsService } from '../../admin/settings/data-access/settings.service';
import {
  CartLineItem,
  CheckoutCustomer,
  CheckoutOrderResult,
  CheckoutPayload
} from '../models/cart.model';

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

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly settingsService = inject(SettingsService);

  readonly coupons: Record<string, number> = { SAVE10: 0.1, WELCOME5: 0.05 };

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

  validateCoupon(code: string): Observable<{ valid: boolean; percent: number }> {
    const percent = this.coupons[code.trim().toUpperCase()] ?? 0;
    return of({ valid: percent > 0, percent }).pipe(delay(150));
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
    }
  ): Observable<CheckoutOrderResult> {
    const orderNumber = `WO-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const items: OrderLineItem[] = payload.items.map((line) => ({
      ...line,
      lineTotal: line.unitPrice * line.quantity
    }));

    const total = payload.subtotal + extras.shippingCost + extras.tax - extras.discount;

    const order: Order = {
      id: orderId,
      orderNumber,
      storeSlug: payload.storeSlug,
      customerName: payload.customer.name,
      customerEmail: payload.customer.email,
      customerPhone: payload.customer.phone,
      shippingAddress: payload.customer,
      items,
      subtotal: payload.subtotal,
      shipping: extras.shippingCost,
      tax: extras.tax,
      discount: extras.discount,
      total,
      currency: payload.currency,
      status: 'pending',
      paymentStatus: extras.paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod: extras.paymentMethod,
      transactionId: `txn_${Date.now()}`,
      couponCode: extras.couponCode,
      shippingMethod: extras.shippingMethod,
      timeline: [
        { id: 't1', label: 'Order placed', at: now, completed: true },
        {
          id: 't2',
          label: 'Payment received',
          at: now,
          completed: extras.paymentMethod !== 'cod'
        }
      ],
      notes: [],
      createdAt: now,
      updatedAt: now
    };

    return this.orderService.createFromCheckout(order).pipe(
      switchMap((saved) =>
        this.paymentService.recordFromOrder(saved).pipe(
          map(() => ({
            orderId: saved.id,
            orderNumber: saved.orderNumber,
            status: saved.status
          }))
        )
      )
    );
  }
}
