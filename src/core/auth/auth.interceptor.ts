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
import { StoreAuthService } from '@features/store/data-access/store-auth.service';
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

  // Guest storefront endpoints (checkout, etc.) resolve their tenant from the request body
  // (storeSlug), not from an admin session. They must never carry a stale ADMIN token from the
  // same browser — attaching one risks a spurious 401 that triggers the retry-after-refresh
  // flow below, which would resubmit a non-idempotent POST (e.g. placing the same order twice).
  // If a CUSTOMER is logged in (separate token, separate storage — see StoreAuthService), attach
  // that instead so the backend can recognize a returning customer's checkout. Never enters the
  // admin refresh-retry loop below, since customer tokens use a different auth lifecycle.
  if (isGuestStorefrontRequest(req.url)) {
    const storeToken = inject(StoreAuthService).getAccessToken();
    return next(storeToken ? addAuthorizationHeader(req, storeToken) : req);
  }

  // Return endpoints are shared between storefront customers and admins. A customer has a
  // store_access_token but no admin token; an admin has an admin token but no store token.
  // Pick whichever is available rather than forcing both paths through isGuestStorefrontRequest
  // (which would break admin sub-routes like /returns/{id}/approve).
  if (isReturnEndpoint(req.url)) {
    const storeAuthService = inject(StoreAuthService);
    const customerToken = storeAuthService.getAccessToken();
    const adminToken = authService.getAccessToken();
    if (customerToken && !adminToken) {
      return next(addAuthorizationHeader(req, customerToken));
    }
    // Admin path falls through to normal token attachment below.
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

/**
 * Anonymous storefront endpoints that resolve tenant from the request body (storeSlug) or a
 * public slug, never from a logged-in session. Must be excluded from auth-header attachment —
 * see the guard in authInterceptor for why.
 */
function isGuestStorefrontRequest(url: string): boolean {
  return /\/checkout\//i.test(url);
}

function isReturnEndpoint(url: string): boolean {
  return /\/returns(?:\/|$|\?)/i.test(url);
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
