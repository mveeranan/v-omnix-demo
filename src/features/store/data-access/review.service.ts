import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import { ProductReview } from '../models/product-review.model';

const MOCK_REVIEWS: ProductReview[] = [
  {
    id: 'r1',
    productId: 'p1',
    authorName: 'Alex P.',
    rating: 5,
    text: 'Great quality hoodie, fits perfectly.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verifiedPurchase: true,
    helpfulYes: 12,
    helpfulNo: 1
  },
  {
    id: 'r2',
    productId: 'p1',
    authorName: 'Jordan M.',
    rating: 4,
    text: 'Soft fabric, slightly runs large.',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    verifiedPurchase: true,
    helpfulYes: 5,
    helpfulNo: 0
  },
  {
    id: 'r3',
    productId: 'p5',
    authorName: 'Sam K.',
    rating: 5,
    text: 'Excellent sound quality for the price.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    verifiedPurchase: true,
    helpfulYes: 8,
    helpfulNo: 0
  }
];

@Injectable({ providedIn: 'root' })
export class ReviewService {
  getReviews(productId: string, sort: 'recent' | 'rating' = 'recent'): Observable<ProductReview[]> {
    let items = MOCK_REVIEWS.filter((r) => r.productId === productId);
    if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
    else items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return of(items).pipe(delay(150));
  }

  getSummary(productId: string): Observable<{ average: number; count: number; breakdown: Record<number, number> }> {
    const items = MOCK_REVIEWS.filter((r) => r.productId === productId);
    const count = items.length;
    const average = count ? items.reduce((s, r) => s + r.rating, 0) / count : 0;
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    items.forEach((r) => breakdown[r.rating]++);
    return of({ average, count, breakdown }).pipe(delay(80));
  }
}
