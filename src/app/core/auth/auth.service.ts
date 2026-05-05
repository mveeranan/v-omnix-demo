import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LoggerService } from '../logging/logger.service';
import { AuthTokens, LoginRequest } from './models/auth.model';
import { AuthTokenDto, AuthTokenMapper } from './mappers/auth-token.mapper';
import { API_ENDPOINTS } from '../../../environments/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly authTokenMapper = inject(AuthTokenMapper);
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  login(payload: LoginRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokenDto>(API_ENDPOINTS.auth.login, payload)
      .pipe(map((dto) => this.authTokenMapper.map(dto)))
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  refreshToken(): Observable<AuthTokens> {
    return this.http
      .post<AuthTokenDto>(API_ENDPOINTS.auth.refresh, {
        refreshToken: this.getRefreshToken()
      })
      .pipe(map((dto) => this.authTokenMapper.map(dto)))
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.logger.info('User session has been cleared.');
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
