import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { BillingCycle } from '../../../shared/models/backend-enums';
import { subscriptionStore } from './subscription.store';
import { SubscriptionStatusDto, TenantSubscription } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  getSubscription(): Observable<TenantSubscription> {
    return of(subscriptionStore.refreshFromSession()).pipe(delay(200));
  }

  getStatus(): Observable<SubscriptionStatusDto> {
    subscriptionStore.refreshFromSession();
    return of(subscriptionStore.getStatus()).pipe(delay(150));
  }

  updateBillingCycle(cycle: BillingCycle): Observable<TenantSubscription> {
    return of(subscriptionStore.updateBillingCycle(cycle)).pipe(delay(250));
  }

  setCancelAtPeriodEnd(cancel: boolean): Observable<TenantSubscription> {
    return of(subscriptionStore.cancelAtPeriodEnd(cancel)).pipe(delay(250));
  }

  refresh(): Observable<TenantSubscription> {
    const sub = subscriptionStore.refreshFromSession();
    if (!sub) return throwError(() => new Error('NOT_FOUND'));
    return of(sub).pipe(delay(150));
  }
}
