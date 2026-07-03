import { Routes } from '@angular/router';
import { StoreShellComponent } from './layout/store-shell.component';
import { StoreHomePageComponent } from './pages/store-home-page.component';
import { StoreAboutPageComponent } from './pages/store-about-page.component';
import { StoreContactPageComponent } from './pages/store-contact-page.component';
import { ProductListPageComponent } from './pages/product-list-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page.component';
import { CartPageComponent } from './cart/cart-page.component';
import { CheckoutPageComponent } from './checkout/checkout-page.component';
import { CheckoutSuccessPageComponent } from './checkout/checkout-success-page.component';
import {
  redirectLegacyCart,
  redirectLegacyCheckout,
  redirectLegacyCheckoutSuccess
} from './guards/store-legacy-route.guard';

export const storeRoutes: Routes = [
  {
    path: 'store/:slug',
    component: StoreShellComponent,
    children: [
      { path: '', component: StoreHomePageComponent },
      { path: 'about', component: StoreAboutPageComponent },
      { path: 'contact', component: StoreContactPageComponent },
      { path: 'products', component: ProductListPageComponent },
      { path: 'products/:productSlug', component: ProductDetailPageComponent },
      { path: 'cart', component: CartPageComponent },
      { path: 'checkout', component: CheckoutPageComponent },
      { path: 'checkout/success', component: CheckoutSuccessPageComponent }
    ]
  },
  {
    path: 'portfolio/:slug',
    redirectTo: 'store/:slug'
  },
  {
    path: 'shop/:slug',
    redirectTo: 'store/:slug/products'
  },
  {
    path: 'cart',
    canActivate: [redirectLegacyCart],
    component: CartPageComponent
  },
  {
    path: 'checkout',
    canActivate: [redirectLegacyCheckout],
    component: CheckoutPageComponent
  },
  {
    path: 'checkout/success',
    canActivate: [redirectLegacyCheckoutSuccess],
    component: CheckoutSuccessPageComponent
  }
];
