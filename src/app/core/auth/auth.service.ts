import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthTokens, LoginRequest } from './models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'https://localhost:7084';
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  login(payload: LoginRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.apiBaseUrl}/Auth/login`, payload)
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  refreshToken(): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.apiBaseUrl}/Auth/refresh`, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  isLoggedIn(): boolean {
    return Boolean(this.getAccessToken());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.accessTokenKey, tokens.accessToken);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
  }
}
