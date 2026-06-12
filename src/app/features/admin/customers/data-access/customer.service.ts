import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Customer, CustomerListFilters, CustomerListResult } from '../models/customer.model';

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Sarah Mitchell',
    email: 'sarah@example.com',
    phone: '+1 555 0101',
    totalOrders: 12,
    totalSpent: 1840,
    currency: 'USD',
    lastOrderDate: new Date().toISOString(),
    signupDate: new Date(Date.now() - 86400000 * 90).toISOString(),
    addresses: [
      {
        id: 'a1',
        label: 'Home',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        country: 'USA',
        isDefault: true
      }
    ],
    notes: []
  },
  {
    id: 'c2',
    name: 'James Chen',
    email: 'james@example.com',
    phone: '+1 555 0102',
    totalOrders: 5,
    totalSpent: 620,
    currency: 'USD',
    lastOrderDate: new Date(Date.now() - 86400000).toISOString(),
    signupDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    addresses: [],
    notes: []
  }
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customers = MOCK_CUSTOMERS.map((c) => structuredClone(c));

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
