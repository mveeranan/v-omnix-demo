import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const marketingRoutes: Routes = [
  {
    path: 'login',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  }
];
