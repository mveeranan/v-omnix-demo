import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';

/**
 * Storefront customer auth — deliberately separate from the admin AuthService and its
 * localStorage keys. Mixing the two caused a real bug earlier (a stale admin token leaking
 * into an anonymous checkout request triggered a duplicate order via the 401-retry flow).
 * A customer logging in on the storefront must never touch, read, or overwrite an admin
 * session, and vice versa.
 */
const STORE_KEYS = {
  accessToken: 'store_access_token',
  customerId: 'store_customer_id',
  firstName: 'store_customer_first_name',
  lastName: 'store_customer_last_name',
  email: 'store_customer_email',
  mobile: 'store_customer_mobile'
} as const;

interface StoreLoginResponseData {
  token: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
}

export interface StoreCustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
}

@Injectable({ providedIn: 'root' })
export class StoreAuthService {
  private readonly http = inject(HttpClient);

  private readonly _isLoggedIn = signal(this.hasStoredToken());
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  login(email: string, password: string): Observable<StoreCustomerProfile> {
    return this.http
      .post<ApiResponse<StoreLoginResponseData>>(API_ENDPOINTS.auth.login, { email, password })
      .pipe(
        map((r) => {
          if (!r.success || !r.data) {
            throw new Error(r.message || 'Invalid email or password.');
          }
          this.persist(r.data);
          const profile = this.getProfile();
          if (!profile) {
            throw new Error('Login succeeded but no profile was returned.');
          }
          return profile;
        })
      );
  }

  logout(): void {
    for (const key of Object.values(STORE_KEYS)) {
      localStorage.removeItem(key);
    }
    this._isLoggedIn.set(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORE_KEYS.accessToken);
  }

  getProfile(): StoreCustomerProfile | null {
    const id = localStorage.getItem(STORE_KEYS.customerId);
    const token = this.getAccessToken();
    if (!id || !token) return null;
    return {
      id,
      firstName: localStorage.getItem(STORE_KEYS.firstName) ?? '',
      lastName: localStorage.getItem(STORE_KEYS.lastName) ?? '',
      email: localStorage.getItem(STORE_KEYS.email) ?? '',
      mobile: localStorage.getItem(STORE_KEYS.mobile) ?? ''
    };
  }

  private persist(data: StoreLoginResponseData): void {
    localStorage.setItem(STORE_KEYS.accessToken, data.token);
    if (data.userId) localStorage.setItem(STORE_KEYS.customerId, data.userId);
    localStorage.setItem(STORE_KEYS.firstName, data.firstName ?? '');
    localStorage.setItem(STORE_KEYS.lastName, data.lastName ?? '');
    localStorage.setItem(STORE_KEYS.email, data.email ?? '');
    localStorage.setItem(STORE_KEYS.mobile, data.mobile ?? '');
    this._isLoggedIn.set(true);
  }

  private hasStoredToken(): boolean {
    return !!localStorage.getItem(STORE_KEYS.accessToken);
  }
}
