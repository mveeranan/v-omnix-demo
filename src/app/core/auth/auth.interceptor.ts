import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { LoggerService } from '../logging/logger.service';
import { API_ENDPOINTS } from '../../../environments/api.constants';

const authEndpoints = [API_ENDPOINTS.auth.login, API_ENDPOINTS.auth.refresh];
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();
  const authReq = accessToken ? addAuthorizationHeader(req, accessToken) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return handleUnauthorized(req, next, authService, router, logger);
    })
  );
};

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  logger: LoggerService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((accessToken) => {
        isRefreshing = false;
        refreshTokenSubject.next(accessToken);
        return next(addAuthorizationHeader(req, accessToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        logger.warn('Token refresh failed. Redirecting to login.', refreshError);
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => refreshError);
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addAuthorizationHeader(req, token)))
  );
}

function addAuthorizationHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isAuthEndpoint(url: string): boolean {
  return authEndpoints.some((endpoint) => url.includes(endpoint));
}
