import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlanSelectionPageComponent } from './plan-selection/plan-selection-page.component';

export const marketingRoutes: Routes = [
  {
    path: 'login',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'select-plan',
    component: PlanSelectionPageComponent
  },
  {
    // Demo-mode-only stand-in for Stripe's hosted checkout page (see demo-mock-checkout-page
    // component for why real Stripe can't run without a backend). Harmless to keep registered
    // in production builds too — it's simply never linked to unless demoMode's billing handler
    // generates a URL pointing here.
    path: 'mock-checkout',
    loadComponent: () =>
      import('./plan-selection/demo-mock-checkout-page.component').then((m) => m.DemoMockCheckoutPageComponent)
  }
];
