import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { newsletterSubscriberStore } from './newsletter-subscriber.store';
import { NewsletterSubscriber, createEmptySubscriber } from '../models/newsletter-subscriber.model';

@Injectable({ providedIn: 'root' })
export class NewsletterAdminService {
  list(): Observable<NewsletterSubscriber[]> {
    return of(newsletterSubscriberStore.getAll()).pipe(delay(150));
  }

  getById(id: string): Observable<NewsletterSubscriber | null> {
    return of(newsletterSubscriberStore.getById(id) ?? null).pipe(delay(100));
  }

  create(input: Omit<NewsletterSubscriber, 'id' | 'subscribedAt'>): Observable<NewsletterSubscriber> {
    return of(newsletterSubscriberStore.create(input)).pipe(delay(200));
  }

  update(id: string, patch: Partial<NewsletterSubscriber>): Observable<NewsletterSubscriber> {
    const updated = newsletterSubscriberStore.update(id, patch);
    if (!updated) return throwError(() => new Error('NOT_FOUND'));
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<void> {
    newsletterSubscriberStore.delete(id);
    return of(undefined).pipe(delay(200));
  }

  createEmpty(tenantId = 'default'): Omit<NewsletterSubscriber, 'id' | 'subscribedAt'> {
    return createEmptySubscriber(tenantId);
  }
}
