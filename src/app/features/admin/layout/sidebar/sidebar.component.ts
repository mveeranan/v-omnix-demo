import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';
import { BrandLogoComponent } from '../../../../shared/brand-logo/brand-logo.component';
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_SECTIONS,
  AdminNavItemConfig,
  AdminNavSection
} from '../../config/admin-nav.config';
import { TenantContextService } from '../../data-access/tenant-context.service';
import { AdminLayoutStateService } from '../../services/admin-layout-state.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, BrandLogoComponent],
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
  private readonly tenantContext = inject(TenantContextService);

  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly sections = ADMIN_NAV_SECTIONS;

  readonly navItems = computed(() =>
    ADMIN_NAV_ITEMS.filter((item) => {
      if (item.requiresCapability === 'manageBranches') {
        return this.tenantContext.canManageBranches();
      }
      return true;
    })
  );

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
