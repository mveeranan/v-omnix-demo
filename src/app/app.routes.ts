import { Routes } from '@angular/router';
import { adminRoutes } from '@features/admin/admin.routes';
import { devRoutes } from '@features/dev/dev.routes';
import { marketingRoutes } from '@features/marketing/marketing.routes';
import { storeRoutes } from '@features/store/store.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  ...marketingRoutes,
  ...devRoutes,
  ...adminRoutes,
  ...storeRoutes,
  {
    path: '**',
    redirectTo: 'home'
  }
];
