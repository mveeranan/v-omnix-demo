import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { PortfolioLoadResult } from '@features/portfolio/models/dto/portfolio-load-result.dto';
import { WorkspaceSessionService } from '@features/portfolio/data-access/workspace-session.service';

/**
 * Never blocks admin navigation waiting on portfolio API.
 * Login bootstrap preloads when possible; this kicks off a background retry for direct URLs.
 */
export const adminWorkspaceResolver: ResolveFn<PortfolioLoadResult> = () => {
  const authService = inject(AuthService);
  const workspaceSession = inject(WorkspaceSessionService);

  if (!authService.isLoggedIn() || !authService.resolveTenantId()) {
    return of({
      user: null,
      businessProfile: null,
      presetId: null,
      heroSlides: [],
      socialMedia: null,
      portfolio: null
    });
  }

  workspaceSession.ensureWorkspaceInBackground();
  return of({
    user: null,
    businessProfile: null,
    presetId: null,
    heroSlides: [],
    socialMedia: null,
    portfolio: null
  });
};
