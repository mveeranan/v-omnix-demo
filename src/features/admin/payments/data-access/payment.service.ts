import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Order } from '../../orders/models/order.model';
import { PaymentListFilters, PaymentListResult, PaymentTransaction } from '../models/payment.model';
import { paymentStore } from './payment.store';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  list(filters: PaymentListFilters = {}): Observable<PaymentListResult> {
    let items = paymentStore.getAll();

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.orderNumber.toLowerCase().includes(q) ||
          t.transactionId.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q)
      );
    }
    if (filters.method) items = items.filter((t) => t.method === filters.method);
    if (filters.status) items = items.filter((t) => t.status === filters.status);

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const start = (page - 1) * pageSize;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidThisMonth = items.filter(
      (t) => new Date(t.createdAt) >= monthStart && t.status === 'paid'
    );

    return of({
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
      totalReceivedThisMonth: paidThisMonth.reduce((s, t) => s + t.amount, 0),
      pendingAmount: items.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0),
      failedCount: items.filter((t) => t.status === 'failed').length,
      totalRevenue: items.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0)
    }).pipe(delay(200));
  }

  getById(id: string): Observable<PaymentTransaction | null> {
    return of(paymentStore.getById(id) ?? null).pipe(delay(100));
  }

  recordFromOrder(order: Order): Observable<PaymentTransaction> {
    const txn: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount: order.total,
      currency: order.currency,
      method: order.paymentMethod,
      status: order.paymentStatus,
      transactionId: order.transactionId ?? `txn_${Date.now()}`,
      createdAt: order.createdAt
    };
    return of(paymentStore.add(txn)).pipe(delay(100));
  }

  processRefund(id: string, amount: number): Observable<PaymentTransaction | null> {
    const txn = paymentStore.getById(id);
    if (!txn) return of(null);
    return of(
      paymentStore.update(id, {
        status: 'refunded',
        refundAmount: amount
      })
    ).pipe(delay(200));
  }
}
