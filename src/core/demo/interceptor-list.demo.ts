import { HttpInterceptorFn } from '@angular/common/http';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { demoApiInterceptor } from './demo-api.interceptor';

/**
 * Demo build only (swapped in via angular.json's "demo" configuration fileReplacements).
 * demoApiInterceptor MUST come first: when environment.demoMode is true it never calls next(),
 * so authInterceptor — and every real network call — is skipped entirely.
 */
export const httpInterceptors: HttpInterceptorFn[] = [demoApiInterceptor, authInterceptor];
