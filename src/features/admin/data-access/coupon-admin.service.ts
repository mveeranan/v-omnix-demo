import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { couponStore } from './coupon.store';
import { Coupon, createEmptyCoupon } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponAdminService {
  list(): Observable<Coupon[]> {
    return of(couponStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<Coupon | null> {
    return of(couponStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<Coupon, 'id' | 'createdAt' | 'useCount'>): Observable<Coupon> {
    return of(couponStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<Coupon>): Observable<Coupon> {
    const updated = couponStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    couponStore.delete(id);
    return of(undefined).pipe(delay(200));
  }

  createEmpty(tenantId = 'default'): Omit<Coupon, 'id' | 'createdAt' | 'useCount'> {
    return createEmptyCoupon(tenantId);
  }
}
