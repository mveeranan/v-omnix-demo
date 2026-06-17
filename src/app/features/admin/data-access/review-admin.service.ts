import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { reviewAdminStore } from './review-admin.store';
import { Review, createEmptyReview } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewAdminService {
  list(): Observable<Review[]> {
    return of(reviewAdminStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<Review | null> {
    return of(reviewAdminStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<Review, 'id' | 'createdAt'>): Observable<Review> {
    return of(reviewAdminStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<Review>): Observable<Review> {
    const updated = reviewAdminStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    reviewAdminStore.delete(id);
    return of(undefined).pipe(delay(200));
  }

  createEmpty(tenantId = 'default'): Omit<Review, 'id' | 'createdAt'> {
    return createEmptyReview(tenantId);
  }
}
