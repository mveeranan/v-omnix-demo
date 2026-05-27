import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TenantContextService } from '../../features/admin/data-access/tenant-context.service';

export const manageBranchesGuard: CanActivateFn = () => {
  const tenantContext = inject(TenantContextService);
  const router = inject(Router);

  tenantContext.syncFromAuthStorage();

  if (tenantContext.canManageBranches()) {
    return true;
  }

  return router.createUrlTree(['/admin/dashboard']);
};
