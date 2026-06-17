import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Order, OrderListFilters, OrderListResult, OrderNote, OrderStatus } from '../models/order.model';
import { orderStore } from './order.store';

@Injectable({ providedIn: 'root' })
export class OrderService {
  list(filters: OrderListFilters = {}): Observable<OrderListResult> {
    let items = orderStore.getAll();

    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }
    if (filters.status) items = items.filter((o) => o.status === filters.status);
    if (filters.paymentStatus) items = items.filter((o) => o.paymentStatus === filters.paymentStatus);

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const start = (page - 1) * pageSize;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return of({
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
      revenueThisMonth: items
        .filter((o) => new Date(o.createdAt) >= monthStart && o.paymentStatus === 'paid')
        .reduce((s, o) => s + o.total, 0),
      ordersThisMonth: items.filter((o) => new Date(o.createdAt) >= monthStart).length
    }).pipe(delay(200));
  }

  getById(id: string): Observable<Order | null> {
    return of(orderStore.getById(id) ?? null).pipe(delay(150));
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order | null> {
    const updated = orderStore.update(id, { status });
    return of(updated).pipe(delay(150));
  }

  addNote(id: string, text: string, author = 'Admin'): Observable<Order | null> {
    const order = orderStore.getById(id);
    if (!order) return of(null);
    const note: OrderNote = {
      id: `n-${Date.now()}`,
      text,
      author,
      at: new Date().toISOString()
    };
    return of(orderStore.update(id, { notes: [...order.notes, note] })).pipe(delay(150));
  }

  createFromCheckout(order: Order): Observable<Order> {
    return of(orderStore.add(order)).pipe(delay(300));
  }
}
