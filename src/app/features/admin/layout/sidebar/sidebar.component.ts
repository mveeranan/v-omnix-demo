import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { AuthService } from '../../../../core/auth/auth.service';
import { PortfolioTenantStateService } from '../../../portfolio/data-access/portfolio-tenant-state.service';
import { getLogoPreviewUrl } from '../../models/business-profile.model';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_SECTIONS,
  AdminNavItemConfig,
  AdminNavSection
} from '../../config/admin-nav.config';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';
import { AdminLayoutStateService } from '../../services/admin-layout-state.service';
import { PlanFeatureService } from '../../services/plan-feature.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    class: 'admin-sidebar-host',
    '[class.admin-sidebar-host--collapsed]': 'collapsed() && !mobile()',
    '[class.admin-sidebar-host--mobile]': 'mobile()'
  }
})
export class SidebarComponent {
  readonly collapsed = input(false);
  readonly mobile = input(false);
  readonly closeMobile = output<void>();

  private readonly layoutState = inject(AdminLayoutStateService);
  private readonly planFeatures = inject(PlanFeatureService);
  private readonly dashboardData = inject(AdminDashboardDataService);
  private readonly authService = inject(AuthService);
  private readonly tenantState = inject(PortfolioTenantStateService);

  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly sections = ADMIN_NAV_SECTIONS;
  readonly navItems = computed(() => ADMIN_NAV_ITEMS);

  readonly tenantName = computed(() => {
    const branding = this.dashboardData.dashboardData().tenant;
    const profile = this.tenantState.businessProfile();
    return (
      branding.businessName?.trim() ||
      profile?.businessName?.trim() ||
      this.authService.getTenantName()?.trim() ||
      'Workspace'
    );
  });

  readonly tenantLogoUrl = computed(() => {
    const branding = this.dashboardData.dashboardData().tenant;
    const profile = this.tenantState.businessProfile();
    return (
      branding.logoUrl?.trim() ||
      getLogoPreviewUrl(profile) ||
      this.authService.getBusinessLogoUrl()?.trim() ||
      ''
    );
  });

  readonly tenantInitials = computed(() => {
    const branding = this.dashboardData.dashboardData().tenant;
    if (branding.logoInitials?.trim()) {
      return branding.logoInitials;
    }
    const name = this.tenantName();
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || 'W'
    );
  });

  readonly navBySection = computed(() => {
    const items = this.navItems();
    const map = new Map<AdminNavSection, AdminNavItemConfig[]>();
    for (const section of ADMIN_NAV_SECTIONS) {
      const sectionItems = items.filter((i) => i.section === section.id);
      if (sectionItems.length > 0) {
        map.set(section.id, sectionItems);
      }
    }
    return map;
  });

  isLocked(item: AdminNavItemConfig): boolean {
    return Boolean(item.featureKey && !this.planFeatures.hasFeature(item.featureKey));
  }

  toggleCollapse(): void {
    if (!this.mobile()) {
      this.layoutState.toggleSidebarCollapsed();
    }
  }

  onNavClick(): void {
    if (this.mobile()) {
      this.closeMobile.emit();
    }
  }
}
