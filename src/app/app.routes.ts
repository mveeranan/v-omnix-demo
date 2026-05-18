import { Routes } from '@angular/router';

import { SampleComponent } from '../components/sample/sample.component';

import { authGuard } from './core/auth/auth.guard';

import { guestGuard } from './core/auth/guest.guard';

import { LoginComponent } from './features/auth/login/login.component';

import { HomeComponent } from '../components/home/home.component';

import { AdminShellComponent } from './features/admin/layout/admin-shell.component';

import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';

import { AdminSectionPageComponent } from './features/admin/pages/admin-section-page.component';

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
        path: 'portfolio',
        component: AdminSectionPageComponent
      },
      {
        path: 'services',
        component: AdminSectionPageComponent
      },
      {
        path: 'bookings',
        component: AdminSectionPageComponent
      },
      {
        path: 'calendar',
        component: AdminSectionPageComponent
      },
      {
        path: 'customers',
        component: AdminSectionPageComponent
      },
      {
        path: 'payments',
        component: AdminSectionPageComponent
      },
      {
        path: 'settings',
        component: AdminSectionPageComponent
      }
    ]
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
