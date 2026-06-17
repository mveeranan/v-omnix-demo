import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminLayoutStateService {
  private readonly sidebarCollapsedKey = 'admin-sidebar-collapsed';

  readonly mobileDrawerOpen = signal(false);
  readonly sidebarCollapsed = signal(this.readCollapsedPreference());

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed.update((value) => {
      const next = !value;
      localStorage.setItem(this.sidebarCollapsedKey, next ? '1' : '0');
      return next;
    });
  }

  openMobileDrawer(): void {
    this.mobileDrawerOpen.set(true);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
    localStorage.setItem(this.sidebarCollapsedKey, collapsed ? '1' : '0');
  }

  private readCollapsedPreference(): boolean {
    return localStorage.getItem(this.sidebarCollapsedKey) === '1';
  }
}
