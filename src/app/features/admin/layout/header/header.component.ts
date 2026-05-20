import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
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
