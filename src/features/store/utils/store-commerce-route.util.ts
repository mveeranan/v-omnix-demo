/** Store-scoped commerce routes (cart, checkout) under /store/:slug/… */

export function storeCartRoute(slug: string | null | undefined): string[] {
  return slug ? ['/store', slug, 'cart'] : ['/cart'];
}

export function storeCheckoutRoute(slug: string | null | undefined): string[] {
  return slug ? ['/store', slug, 'checkout'] : ['/checkout'];
}

export function storeCheckoutSuccessRoute(slug: string | null | undefined): string[] {
  return slug ? ['/store', slug, 'checkout', 'success'] : ['/checkout/success'];
}
