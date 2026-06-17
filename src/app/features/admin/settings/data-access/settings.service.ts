import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  EmailSettings,
  GeneralSettings,
  IntegrationSettings,
  PaymentSettings,
  PolicySettings,
  SettingsCategory,
  ShippingSettings,
  StoreSettings,
  TaxSettings,
  TeamMember
} from '../models/store-settings.model';
import { ecommerceConfigStore } from '../../data-access/ecommerce-config.store';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  getAll(): Observable<StoreSettings> {
    return of(ecommerceConfigStore.get()).pipe(delay(150));
  }

  getShipping(): Observable<ShippingSettings> {
    return of(structuredClone(ecommerceConfigStore.get().shipping)).pipe(delay(50));
  }

  getTax(): Observable<TaxSettings> {
    return of(structuredClone(ecommerceConfigStore.get().tax)).pipe(delay(50));
  }

  getPayment(): Observable<PaymentSettings> {
    return of(structuredClone(ecommerceConfigStore.get().payment)).pipe(delay(50));
  }

  updateCategory<K extends SettingsCategory>(
    category: K,
    data: StoreSettings[K]
  ): Observable<StoreSettings> {
    ecommerceConfigStore.updateSection(category, structuredClone(data) as StoreSettings[K]);
    return of(ecommerceConfigStore.get()).pipe(delay(200));
  }

  getGeneral(): Observable<GeneralSettings> {
    return of(structuredClone(ecommerceConfigStore.get().general)).pipe(delay(50));
  }

  getEmail(): Observable<EmailSettings> {
    return of(structuredClone(ecommerceConfigStore.get().email)).pipe(delay(50));
  }

  getPolicies(): Observable<PolicySettings> {
    return of(structuredClone(ecommerceConfigStore.get().policies)).pipe(delay(50));
  }

  getTeam(): Observable<TeamMember[]> {
    return of(structuredClone(ecommerceConfigStore.get().team)).pipe(delay(50));
  }

  getIntegrations(): Observable<IntegrationSettings> {
    return of(structuredClone(ecommerceConfigStore.get().integrations)).pipe(delay(50));
  }
}
