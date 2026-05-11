import { Routes } from '@angular/router';
import { SampleComponent } from '../components/sample/sample.component';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from '../components/home/home.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';

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
        component:SampleComponent
    },
    {
        path: 'signalr',
        canActivate: [authGuard],
        loadComponent: () => import('../components/signal-r/signal-r.component').then(m => m.SignalRComponent)
    },
    {
        path: 'admin/dashboard',
        component: AdminDashboardComponent
    },
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
