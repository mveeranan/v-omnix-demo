import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, switchMap } from 'rxjs';
import {
  GeneralSettings,
  PaymentSettings,
  PolicySettings,
  SettingsCategory,
  ShippingSettings,
  StoreSettings,
  TaxSettings
} from '../models/store-settings.model';
import { ecommerceConfigStore } from '../../data-access/ecommerce-config.store';
import { ApiResponse } from '@shared/models/api-response.model';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly apiUrl = `${environment.apiBaseUrl}/ecommerce/settings`;
  private readonly ALLOWED_CATEGORIES: SettingsCategory[] = [
    'general',
    'shipping',
    'tax',
    'payment',
    'policies'
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<StoreSettings> {
    return this.http.get<ApiResponse<StoreSettings>>(this.apiUrl).pipe(
      switchMap(response => of(response.data!)),
      catchError(() => of(ecommerceConfigStore.get()))
    );
  }

  getShipping(): Observable<ShippingSettings> {
    return this.getAll().pipe(
      switchMap(settings => of(settings.shipping)),
      catchError(() => of(ecommerceConfigStore.get().shipping))
    );
  }

  getTax(): Observable<TaxSettings> {
    return this.getAll().pipe(
      switchMap(settings => of(settings.tax)),
      catchError(() => of(ecommerceConfigStore.get().tax))
    );
  }

  getPayment(): Observable<PaymentSettings> {
    return this.getAll().pipe(
      switchMap(settings => of(settings.payment)),
      catchError(() => of(ecommerceConfigStore.get().payment))
    );
  }

  updateCategory(
    category: SettingsCategory,
    data: unknown
  ): Observable<StoreSettings> {
    if (!this.ALLOWED_CATEGORIES.includes(category)) {
      throw new Error(`Invalid settings category: ${category}. Allowed categories: ${this.ALLOWED_CATEGORIES.join(', ')}`);
    }

    return this.http.patch<ApiResponse<StoreSettings>>(
      `${this.apiUrl}/${category}`,
      { category, data }
    ).pipe(
      switchMap(response => {
        // Also update local cache
        ecommerceConfigStore.updateSection(category, structuredClone(data) as never);
        return of(response.data!);
      }),
      catchError(() => {
        // Fallback to local store
        ecommerceConfigStore.updateSection(category, structuredClone(data) as never);
        return of(ecommerceConfigStore.get());
      })
    );
  }

  getGeneral(): Observable<GeneralSettings> {
    return this.getAll().pipe(
      switchMap(settings => of(settings.general)),
      catchError(() => of(ecommerceConfigStore.get().general))
    );
  }

  getPolicies(): Observable<PolicySettings> {
    return this.getAll().pipe(
      switchMap(settings => of(settings.policies)),
      catchError(() => of(ecommerceConfigStore.get().policies))
    );
  }

}
