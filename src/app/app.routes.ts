import { Routes } from '@angular/router';
import { SampleComponent } from '../components/sample/sample.component';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'sample'
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
        path: '**',
        redirectTo: 'sample'
    }
];
