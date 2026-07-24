import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { Coupon, createEmptyCoupon } from '../models/coupon.model';

interface ListCouponsResponse {
  items: Coupon[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class CouponAdminService {
  private readonly http = inject(HttpClient);

  list(): Observable<Coupon[]> {
    return this.http.get<ApiResponse<ListCouponsResponse>>(API_ENDPOINTS.coupons.list)
      .pipe(map(response => response.data?.items || []));
  }

  getById(id: string): Observable<Coupon | null> {
    return this.http.get<ApiResponse<Coupon>>(API_ENDPOINTS.coupons.update(id))
      .pipe(map(response => response.data || null));
  }

  create(input: Omit<Coupon, 'id' | 'createdAt' | 'usageCount' | 'tenantId'>): Observable<Coupon> {
    return this.http.post<ApiResponse<Coupon>>(API_ENDPOINTS.coupons.create, input)
      .pipe(map(response => response.data));
  }

  update(id: string, patch: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<ApiResponse<Coupon>>(API_ENDPOINTS.coupons.update(id), patch)
      .pipe(map(response => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<string>>(API_ENDPOINTS.coupons.delete(id))
      .pipe(map(() => undefined));
  }

  createEmpty(): Omit<Coupon, 'id' | 'createdAt' | 'usageCount' | 'tenantId'> {
    return createEmptyCoupon();
  }
}
