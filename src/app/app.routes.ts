import { Routes } from '@angular/router';

import { SampleComponent } from '../components/sample/sample.component';

import { authGuard } from './core/auth/auth.guard';

import { guestGuard } from './core/auth/guest.guard';

import { LoginComponent } from './features/auth/login/login.component';

import { HomeComponent } from '../components/home/home.component';

import { AdminShellComponent } from './features/admin/layout/admin-shell.component';

import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';

import { AdminProfileComponent } from './features/admin/pages/admin-profile.component';
import { PortfolioEditorComponent } from './features/portfolio/editor/portfolio-editor.component';
import { StoreShellComponent } from './features/store/layout/store-shell.component';
import { StoreHomePageComponent } from './features/store/pages/store-home-page.component';
import { StoreAboutPageComponent } from './features/store/pages/store-about-page.component';
import { StoreContactPageComponent } from './features/store/pages/store-contact-page.component';
import { ProductListPageComponent } from './features/store/pages/product-list-page.component';
import { ProductDetailPageComponent } from './features/store/pages/product-detail-page.component';
import { CartPageComponent } from './features/store/cart/cart-page.component';
import { CheckoutPageComponent } from './features/store/checkout/checkout-page.component';
import { CheckoutSuccessPageComponent } from './features/store/checkout/checkout-success-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginComponent
  },
  {
    path: 'sample',
    canActivate: [authGuard],
    component: SampleComponent
  },
  {
    path: 'signalr',
    canActivate: [authGuard],
    loadComponent: () => import('../components/signal-r/signal-r.component').then(m => m.SignalRComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'profile',
        component: AdminProfileComponent
      },
      {
        path: 'portfolio',
        redirectTo: 'website',
        pathMatch: 'full'
      },
      {
        path: 'website',
        component: PortfolioEditorComponent
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/products-list.component').then((m) => m.ProductsListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/admin/products/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/admin/products/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/orders-list.component').then((m) => m.OrdersListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/admin/orders/order-detail.component').then((m) => m.OrderDetailComponent)
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/customers/customers-list.component').then((m) => m.CustomersListComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/admin/customers/customer-detail.component').then((m) => m.CustomerDetailComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/admin/payments/payments-list.component').then((m) => m.PaymentsListComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/settings.component').then((m) => m.SettingsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/categories-list.component').then((m) => m.CategoriesListComponent)
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./features/admin/brands/brands-list.component').then((m) => m.BrandsListComponent)
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./features/admin/billing/billing.component').then((m) => m.BillingComponent)
      },
      {
        path: 'returns',
        loadComponent: () =>
          import('./features/admin/returns/returns-list.component').then((m) => m.ReturnsListComponent)
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/admin/reviews/reviews-list.component').then((m) => m.ReviewsListComponent)
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/admin/coupons/coupons-list.component').then((m) => m.CouponsListComponent)
      },
      {
        path: 'newsletter',
        loadComponent: () =>
          import('./features/admin/newsletter/newsletter-list.component').then((m) => m.NewsletterListComponent)
      },
      {
        path: 'tax',
        loadComponent: () =>
          import('./features/admin/tax/tax-rules.component').then((m) => m.TaxRulesComponent)
      }
    ]
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'store/:slug',
    component: StoreShellComponent,
    children: [
      { path: '', component: StoreHomePageComponent },
      { path: 'about', component: StoreAboutPageComponent },
      { path: 'contact', component: StoreContactPageComponent },
      { path: 'products', component: ProductListPageComponent },
      { path: 'products/:productSlug', component: ProductDetailPageComponent }
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
    component: CartPageComponent
  },
  {
    path: 'checkout',
    component: CheckoutPageComponent
  },
  {
    path: 'checkout/success',
    component: CheckoutSuccessPageComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
