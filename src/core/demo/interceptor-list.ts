import { HttpInterceptorFn } from '@angular/common/http';
import { authInterceptor } from '@core/auth/auth.interceptor';

/**
 * Production/development interceptor list — deliberately does NOT reference demoApiInterceptor.
 * The "demo" build configuration swaps this whole file out for interceptor-list.demo.ts via
 * angular.json fileReplacements (the same mechanism used for environment.ts). That means the
 * demo interceptor and everything it imports (every handler in src/core/demo/handlers, and all
 * of src/mock-data/*.json) are textually absent from this file's module graph — esbuild can't
 * bundle what nothing here ever imports, so the real production bundle carries zero demo-mode
 * bytes. A runtime `if (environment.demoMode)` check alone would not achieve this: the function
 * reference itself (and its imports) would still need to exist in the bundle to be passed into
 * withInterceptors(), even if it never executes.
 */
export const httpInterceptors: HttpInterceptorFn[] = [authInterceptor];
