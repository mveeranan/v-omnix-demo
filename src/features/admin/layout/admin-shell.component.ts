import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { AdminLayoutStateService } from '../services/admin-layout-state.service';
import { TenantContextService } from '../data-access/tenant-context.service';
import { PortfolioTenantStateService } from '../../portfolio/data-access/portfolio-tenant-state.service';
import { AuthService } from '@core/auth/auth.service';
import { backdropFade, drawerSlide } from '../animations/admin.animations';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
  animations: [drawerSlide, backdropFade]
})
export class AdminShellComponent implements OnInit {
  private readonly layoutState = inject(AdminLayoutStateService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly tenantPortfolioState = inject(PortfolioTenantStateService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly mobileDrawerOpen = this.layoutState.mobileDrawerOpen;
  readonly sidebarCollapsed = this.layoutState.sidebarCollapsed;

  isMobile = false;

  ngOnInit(): void {
    this.tenantContext.syncFromAuthStorage();
    if (this.authService.isLoggedIn()) {
      // Defer workspace fetch so the shell paints and stays interactive first.
      setTimeout(() => this.tenantPortfolioState.ensureLoaded(), 0);
    }
    this.updateBreakpoints();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.layoutState.closeMobileDrawer());
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateBreakpoints();
  }

  openMobileDrawer(): void {
    this.layoutState.openMobileDrawer();
  }

  closeMobileDrawer(): void {
    this.layoutState.closeMobileDrawer();
  }

  get sidebarCollapsedForView(): boolean {
    return !this.isMobile && this.sidebarCollapsed();
  }

  /** Main content left edge for in-page modals (sidebar width on desktop). */
  get modalInsetLeft(): string {
    if (this.isMobile) {
      return '0px';
    }
    return this.sidebarCollapsedForView
      ? 'var(--sidebar-width-collapsed)'
      : 'var(--sidebar-width)';
  }

  private updateBreakpoints(): void {
    const width = window.innerWidth;
    this.isMobile = width < 768;

    if (!this.isMobile && this.mobileDrawerOpen()) {
      this.layoutState.closeMobileDrawer();
    }
  }
}
