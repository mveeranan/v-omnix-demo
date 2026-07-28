import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { httpInterceptors } from '@core/demo/interceptor-list';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // httpInterceptors resolves to interceptor-list.ts (auth only) in production/development,
    // or interceptor-list.demo.ts (demo + auth) in the "demo" build — swapped via angular.json
    // fileReplacements so demo-only code never ships in a real build. See interceptor-list.ts.
    provideHttpClient(withInterceptors(httpInterceptors)),
    provideAnimationsAsync()
  ]
};
