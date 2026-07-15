import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { Customer, CustomerListFilters, CustomerListResult } from '../models/customer.model';

interface BackendCustomerSummary {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  lastOrderDate?: string | null;
  signupDate: string;
}

interface BackendCustomerListResponse {
  items: BackendCustomerSummary[];
  total: number;
  page: number;
  pageSize: number;
}

interface BackendCustomerAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  isDefault: boolean;
}

interface BackendCustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: number;
  placedAt: string;
}

interface BackendCustomerDetail extends BackendCustomerSummary {
  addresses: BackendCustomerAddress[];
  orders: BackendCustomerOrderSummary[];
}

function mapSummaryToCustomer(s: BackendCustomerSummary): Customer {
  return {
    id: s.id,
    name: s.name,
    email: s.email ?? '',
    phone: s.phone ?? '',
    totalOrders: s.totalOrders,
    totalSpent: s.totalSpent,
    currency: s.currency,
    lastOrderDate: s.lastOrderDate ?? '',
    signupDate: s.signupDate,
    addresses: [],
    orders: [],
    notes: []
  };
}

function mapDetailToCustomer(d: BackendCustomerDetail): Customer {
  return {
    ...mapSummaryToCustomer(d),
    addresses: d.addresses.map((a) => ({
      id: a.id,
      label: a.label,
      street: a.street,
      city: a.city,
      state: a.state ?? '',
      zip: a.zip ?? '',
      country: a.country ?? '',
      isDefault: a.isDefault
    })),
    orders: d.orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      grandTotal: o.grandTotal,
      placedAt: o.placedAt
    }))
  };
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);

  list(filters: CustomerListFilters = {}): Observable<CustomerListResult> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 1))
      .set('pageSize', String(filters.pageSize ?? 25));
    if (filters.search) params = params.set('search', filters.search);

    return this.http
      .get<ApiResponse<BackendCustomerListResponse>>(API_ENDPOINTS.customers.list, { params })
      .pipe(
        map((r) => {
          const data = r.data ?? { items: [], total: 0, page: 1, pageSize: 25 };
          return {
            items: data.items.map(mapSummaryToCustomer),
            total: data.total,
            page: data.page,
            pageSize: data.pageSize
          };
        })
      );
  }

  getById(id: string): Observable<Customer | null> {
    return this.http
      .get<ApiResponse<BackendCustomerDetail>>(API_ENDPOINTS.customers.get(id))
      .pipe(map((r) => (r.data ? mapDetailToCustomer(r.data) : null)));
  }
}
