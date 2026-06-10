import { Routes } from '@angular/router';

import { SampleComponent } from '../components/sample/sample.component';

import { authGuard } from './core/auth/auth.guard';

import { guestGuard } from './core/auth/guest.guard';

import { LoginComponent } from './features/auth/login/login.component';

import { HomeComponent } from '../components/home/home.component';

import { AdminShellComponent } from './features/admin/layout/admin-shell.component';

import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';

import { AdminSectionPageComponent } from './features/admin/pages/admin-section-page.component';
import { AdminBookingsListComponent } from './features/admin/bookings/pages/admin-bookings-list.component';
import { AdminBookingCreateComponent } from './features/admin/bookings/pages/admin-booking-create.component';
import { AdminBookingDetailsComponent } from './features/admin/bookings/pages/admin-booking-details.component';
import { AdminBookingCalendarComponent } from './features/admin/bookings/pages/admin-booking-calendar.component';
import { AdminServicesComponent } from './features/admin/pages/admin-services.component';
import { AdminBranchesComponent } from './features/admin/pages/admin-branches.component';
import { AdminProfileComponent } from './features/admin/pages/admin-profile.component';
import { manageBranchesGuard } from './core/auth/manage-branches.guard';
import { PortfolioEditorComponent } from './features/portfolio/editor/portfolio-editor.component';
import { PublicPortfolioComponent } from './features/portfolio/public/public-portfolio.component';

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
        component: PortfolioEditorComponent
      },
      {
        path: 'services',
        component: AdminServicesComponent
      },
      {
        path: 'branches',
        canActivate: [manageBranchesGuard],
        component: AdminBranchesComponent
      },
      { path: 'bookings', component: AdminBookingsListComponent },
      { path: 'bookings/new', component: AdminBookingCreateComponent },
      { path: 'bookings/:id', component: AdminBookingDetailsComponent },
      {
        path: 'calendar',
        component: AdminBookingCalendarComponent
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
    path: 'portfolio/:slug',
    component: PublicPortfolioComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
