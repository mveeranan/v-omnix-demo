import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoggerService } from '../logging/logger.service';
import { PortfolioTenantStateService } from '@features/portfolio/data-access/portfolio-tenant-state.service';
import { API_ENDPOINTS } from '@env/api.constants';

const authEndpoints = [API_ENDPOINTS.auth.login, API_ENDPOINTS.auth.refresh];
/** Marks a request that already went through one refresh-and-retry cycle. */
const AUTH_RETRY_HEADER = 'X-Auth-Retry';
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null | 'failed'>(null);
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);
  const injector = inject(Injector);

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();
  const tenantId = authService.getTenantId();
  let finalReq = accessToken ? addAuthorizationHeader(req, accessToken) : req;
  finalReq = tenantId ? addTenantIdHeader(finalReq, tenantId) : finalReq;

  return next(finalReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Workspace bootstrap for brand-new tenants may legitimately 401 before data exists.
      // Do not enter the refresh loop for portfolio reads — let callers degrade gracefully.
      if (isPortfolioRequest(req.url)) {
        return throwError(() => error);
      }

      if (req.headers.has(AUTH_RETRY_HEADER)) {
        logger.warn('Unauthorized after token refresh; not retrying again.', {
          url: req.url,
          status: error.status
        });
        return throwError(() => error);
      }

      return handleUnauthorized(req, next, authService, router, logger, injector);
    })
  );
};

function isPortfolioRequest(url: string): boolean {
  return /\/portfolio\//i.test(url);
}

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  logger: LoggerService,
  injector: Injector
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((accessToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(accessToken);
        return next(markAuthRetried(addAuthorizationHeader(req, accessToken)));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next('failed');
        logger.warn('Token refresh failed. Redirecting to home.', refreshError);
        authService.logout();
        injector.get(PortfolioTenantStateService).clearSession();
        void router.navigate(['/home']);
        return throwError(() => refreshError);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => typeof token === 'string' && token.length > 0),
    take(1),
    switchMap((token) => next(markAuthRetried(addAuthorizationHeader(req, token))))
  );
}

function addAuthorizationHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function addTenantIdHeader(req: HttpRequest<unknown>, tenantId: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      'X-Tenant-Id': tenantId
    }
  });
}

function markAuthRetried(req: HttpRequest<unknown>): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      [AUTH_RETRY_HEADER]: '1'
    }
  });
}

function isAuthEndpoint(url: string): boolean {
  return authEndpoints.some((endpoint) => url.includes(endpoint));
}
