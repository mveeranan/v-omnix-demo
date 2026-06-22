import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const subscriptionGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  if (!authService.requiresSubscriptionPayment()) {
    return true;
  }

  return router.createUrlTree(['/select-plan'], {
    queryParams: {
      flow: 'renew',
      returnUrl: state.url
    }
  });
};
