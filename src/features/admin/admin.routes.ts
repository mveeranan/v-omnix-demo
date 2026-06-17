import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/auth.guard';
import { AdminShellComponent } from './layout/admin-shell.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminProfileComponent } from './pages/admin-profile.component';
import { PortfolioEditorComponent } from '../portfolio/editor/portfolio-editor.component';

export const adminRoutes: Routes = [
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
          import('./products/products-list.component').then((m) => m.ProductsListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./products/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./products/product-form.component').then((m) => m.ProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders-list.component').then((m) => m.OrdersListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./orders/order-detail.component').then((m) => m.OrderDetailComponent)
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./customers/customers-list.component').then((m) => m.CustomersListComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./customers/customer-detail.component').then((m) => m.CustomerDetailComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./payments/payments-list.component').then((m) => m.PaymentsListComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.component').then((m) => m.SettingsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/categories-list.component').then((m) => m.CategoriesListComponent)
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./brands/brands-list.component').then((m) => m.BrandsListComponent)
      },
      {
        path: 'billing',
        loadComponent: () =>
          import('./billing/billing.component').then((m) => m.BillingComponent)
      },
      {
        path: 'returns',
        loadComponent: () =>
          import('./returns/returns-list.component').then((m) => m.ReturnsListComponent)
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./reviews/reviews-list.component').then((m) => m.ReviewsListComponent)
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./coupons/coupons-list.component').then((m) => m.CouponsListComponent)
      },
      {
        path: 'newsletter',
        loadComponent: () =>
          import('./newsletter/newsletter-list.component').then((m) => m.NewsletterListComponent)
      },
      {
        path: 'tax',
        loadComponent: () =>
          import('./tax/tax-rules.component').then((m) => m.TaxRulesComponent)
      }
    ]
  }
];
