import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';

export const devRoutes: Routes = [
  {
    path: 'signalr',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./signal-r/signal-r.component').then((m) => m.SignalRComponent)
  }
];
