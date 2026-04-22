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
import { AuthTokens } from './models/auth.model';
import { AuthService } from './auth.service';

const authEndpoints = ['/Auth/login', '/Auth/refresh'];
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

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

      return handleUnauthorized(req, next, authService, router);
    })
  );
};

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokens: AuthTokens) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.accessToken);
        return next(addAuthorizationHeader(req, tokens.accessToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
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
