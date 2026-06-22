import { Injectable, inject } from '@angular/core';
import { catchError, Observable, of, timeout } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { AuthContext } from '@core/auth/models/auth.model';
import { TenantContextService } from '@features/admin/data-access/tenant-context.service';
import { PortfolioLoadResult } from '../models/dto/portfolio-load-result.dto';
import { PortfolioTenantStateService } from './portfolio-tenant-state.service';

/** Max wait during login / tenant switch — never block the UI longer than this. */
export const WORKSPACE_BOOTSTRAP_TIMEOUT_MS = 8_000;

const EMPTY_WORKSPACE: PortfolioLoadResult = {
  user: null,
  businessProfile: null,
  presetId: null,
  heroSlides: [],
  socialMedia: null,
  portfolio: null
};

/**
 * Loads workspace data after login / tenant switch so admin UI has correct tenant state
 * before navigation (avoids stale cache and empty first paint).
 *
 * Uses a short bootstrap timeout so brand-new tenants (slow/401 portfolio) never freeze login.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceSessionService {
  private readonly auth = inject(AuthService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly tenantState = inject(PortfolioTenantStateService);

  /** Persist workspace context, clear cached tenant data, and load fresh portfolio aggregate. */
  prepareContext(context: AuthContext): Observable<PortfolioLoadResult> {
    this.auth.persistActiveContext(context);
    return this.loadActiveWorkspace();
  }

  /** Use after login when context is already persisted (e.g. authService.login). */
  loadActiveWorkspace(): Observable<PortfolioLoadResult> {
    this.tenantContext.syncFromAuthStorage();
    this.tenantState.clearSession();
    return this.bootstrapLoad();
  }

  /** Best-effort preload with a hard time cap; always emits (never hangs login). */
  bootstrapLoad(): Observable<PortfolioLoadResult> {
    return this.tenantState.ensureLoaded$().pipe(
      timeout(WORKSPACE_BOOTSTRAP_TIMEOUT_MS),
      catchError(() => of(EMPTY_WORKSPACE))
    );
  }

  /** Non-blocking kick-off for route entry / admin shell (retries in background). */
  ensureWorkspaceInBackground(): void {
    this.tenantContext.syncFromAuthStorage();
    this.tenantState.ensureLoaded();
  }
}
