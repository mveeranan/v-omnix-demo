import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '@env/environment';
import { DemoDbService } from './demo-db.service';
import { DemoRequestContext } from './generic-crud';
import { handleAuth } from './handlers/auth.handler';
import { handleBilling } from './handlers/billing.handler';
import { handleCatalogTaxonomy } from './handlers/catalog.handler';
import { handleProducts } from './handlers/products.handler';
import { handleCustomers } from './handlers/customers.handler';
import { handleOrders } from './handlers/orders.handler';
import { handleDocuments } from './handlers/documents.handler';
import { handleTenantSite } from './handlers/tenant-site.handler';
import { handleStoreCatalog } from './handlers/store-catalog.handler';
import { handleCheckout } from './handlers/checkout.handler';
import { handleCart } from './handlers/cart.handler';
import { handleMisc } from './handlers/misc.handler';

/**
 * When environment.demoMode is true, this replaces the network entirely: every HttpClient call
 * this app makes (auth, catalog, orders, customers, billing, ...) is answered from a LocalStorage
 * "fake database" instead of the real .NET API. Every existing service, component and model is
 * untouched — they still call the exact same API_ENDPOINTS URLs and still get back the same
 * ApiResponse<T> envelope; only the transport is swapped, at a single seam.
 *
 * In production/development builds (demoMode = false) this is a no-op passthrough.
 */
export const demoApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.demoMode) {
    return next(req);
  }

  const db = inject(DemoDbService);

  const absolute = new URL(req.urlWithParams, window.location.origin);
  // demoApiInterceptor short-circuits the chain (never calls next()), so authInterceptor's
  // X-Tenant-Id header attachment never runs in demo mode — read the same localStorage key
  // (AuthService's STORAGE_KEYS.tenantId) directly instead.
  const ctx: DemoRequestContext = {
    method: req.method,
    path: absolute.pathname,
    query: absolute.searchParams,
    body: req.body,
    tenantId: absolute.searchParams.get('tenantId') ?? localStorage.getItem('tenant_id')
  };

  const response =
    handleAuth(db, ctx) ??
    handleBilling(db, ctx) ??
    handleDocuments(db, ctx) ??
    handleCatalogTaxonomy(db, ctx) ??
    handleProducts(db, ctx) ??
    handleCustomers(db, ctx) ??
    handleOrders(db, ctx) ??
    handleTenantSite(db, ctx) ??
    handleStoreCatalog(db, ctx) ??
    handleCheckout(db, ctx) ??
    handleCart(db, ctx) ??
    handleMisc(db, ctx) ??
    // Safety net: an endpoint we haven't explicitly modeled still gets a valid, harmless
    // ApiResponse envelope instead of a real (and in demo mode, unreachable) network call.
    new HttpResponse({ status: 200, body: { success: true, message: 'OK (demo)', data: null } });

  // A tiny artificial delay so loading spinners/skeletons in the UI are visible, same as a
  // real network round-trip would produce — purely cosmetic, not required for correctness.
  return of(response).pipe(delay(150));
};
