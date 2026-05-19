import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { AdminLayoutStateService } from '../services/admin-layout-state.service';
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
  private readonly router = inject(Router);

  readonly mobileDrawerOpen = this.layoutState.mobileDrawerOpen;
  readonly sidebarCollapsed = this.layoutState.sidebarCollapsed;

  isMobile = false;

  ngOnInit(): void {
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

  private updateBreakpoints(): void {
    const width = window.innerWidth;
    this.isMobile = width < 768;

    if (!this.isMobile && this.mobileDrawerOpen()) {
      this.layoutState.closeMobileDrawer();
    }
  }
}
