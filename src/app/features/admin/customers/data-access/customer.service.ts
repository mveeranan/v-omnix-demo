import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Customer, CustomerListFilters, CustomerListResult } from '../models/customer.model';
import { getDemoCustomer } from '../../../../core/demo/demo-application.seed';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customers = [getDemoCustomer()];

  list(filters: CustomerListFilters = {}): Observable<CustomerListResult> {
    let items = [...this.customers];
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 25;
    const start = (page - 1) * pageSize;
    return of({
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize
    }).pipe(delay(200));
  }

  getById(id: string): Observable<Customer | null> {
    const c = this.customers.find((x) => x.id === id);
    return of(c ? structuredClone(c) : null).pipe(delay(150));
  }

  upsertFromOrder(name: string, email: string, phone: string, orderTotal: number): void {
    let c = this.customers.find((x) => x.email === email);
    if (!c) {
      c = {
        id: `c-${Date.now()}`,
        name,
        email,
        phone,
        totalOrders: 0,
        totalSpent: 0,
        currency: 'USD',
        lastOrderDate: new Date().toISOString(),
        signupDate: new Date().toISOString(),
        addresses: [],
        notes: []
      };
      this.customers.push(c);
    }
    c.totalOrders += 1;
    c.totalSpent += orderTotal;
    c.lastOrderDate = new Date().toISOString();
  }
}
