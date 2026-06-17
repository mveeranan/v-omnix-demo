import { CommonModule } from '@angular/common';
import { Component, computed, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Settings,
  LogOut
} from 'lucide-angular';
import { ThemeService } from '../../../../core/theme/theme.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminDashboardDataService } from '../../services/admin-dashboard-data.service';
import { PortfolioTenantStateService } from '../../../portfolio/data-access/portfolio-tenant-state.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  readonly menuToggle = output<void>();

  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dataService = inject(AdminDashboardDataService);
  private readonly tenantState = inject(PortfolioTenantStateService);

  readonly searchIcon = Search;
  readonly bellIcon = Bell;
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly menuIcon = Menu;
  readonly chevronDown = ChevronDown;
  readonly settingsIcon = Settings;
  readonly logoutIcon = LogOut;

  readonly profileOpen = signal(false);
  readonly searchExpanded = signal(false);

  readonly isDark = this.themeService.isDark;
  readonly notificationCount = this.dataService.unreadNotificationCount;

  readonly displayName = computed(() => {
    const user = this.tenantState.user();
    const first = user?.firstName?.trim() || this.authService.getFirstName()?.trim() || '';
    const last = user?.lastName?.trim() || this.authService.getLastName()?.trim() || '';
    const fullName = `${first} ${last}`.trim();
    return fullName || this.authService.getEmail()?.trim() || 'User';
  });

  readonly profileImageUrl = computed(() => {
    const fromUser = this.tenantState.user()?.profileImageUrl?.trim();
    return fromUser || this.authService.getProfileImageUrl()?.trim() || '';
  });

  readonly roleName = computed(() => this.authService.getRoleName()?.trim() || '');

  readonly profileInitials = computed(() => {
    const user = this.tenantState.user();
    const first = user?.firstName?.trim() || this.authService.getFirstName()?.trim() || '';
    const last = user?.lastName?.trim() || this.authService.getLastName()?.trim() || '';
    if (first || last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
    const email = this.authService.getEmail()?.trim();
    return email ? email.charAt(0).toUpperCase() : 'U';
  });

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleProfile(): void {
    this.profileOpen.update((v) => !v);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  goToSettings(): void {
    this.closeProfile();
    this.router.navigate(['/admin/settings']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onMenuClick(): void {
    this.menuToggle.emit();
  }
}
