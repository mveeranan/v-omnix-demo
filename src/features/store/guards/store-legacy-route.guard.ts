import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartStateService } from '../data-access/cart-state.service';

function redirectWhenSlugKnown(segment: 'cart' | 'checkout' | 'checkout/success'): CanActivateFn {
  return () => {
    const cart = inject(CartStateService);
    const router = inject(Router);
    const slug = cart.storeSlug();
    if (!slug) return true;
    const path = segment === 'checkout/success'
      ? ['/store', slug, 'checkout', 'success']
      : ['/store', slug, segment];
    return router.createUrlTree(path);
  };
}

export const redirectLegacyCart = redirectWhenSlugKnown('cart');
export const redirectLegacyCheckout = redirectWhenSlugKnown('checkout');
export const redirectLegacyCheckoutSuccess = redirectWhenSlugKnown('checkout/success');
