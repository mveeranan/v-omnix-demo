import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X, ShoppingCart, Moon, Sun } from 'lucide-angular';
import { Portfolio, PortfolioThemeMode } from '../../portfolio/models/portfolio.model';
import { CartStateService } from '../data-access/cart-state.service';
import { StoreThemeService } from '../data-access/store-theme.service';
import { CartDrawerComponent } from '../commerce/cart-drawer.component';

@Component({
  selector: 'app-store-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, CartDrawerComponent],
  template: `
    <header class="mox-header store-nav" [class.store-nav--preview]="previewMode()">
      <div class="container mx-auto px-6">
        <div class="mox-header__inner">
          <a [routerLink]="storeBase()" class="mox-header__brand">
            @if (portfolio().brand.logoUrl) {
              <img [src]="portfolio().brand.logoUrl" alt="" class="mox-header__logo" />
            }
            {{ portfolio().brand.businessName || 'Store' }}
          </a>

          <nav class="mox-header__nav" aria-label="Main">
            @for (link of navLinks(); track link.label) {
              <a
                [routerLink]="link.path"
                routerLinkActive="mox-header__link--active"
                [routerLinkActiveOptions]="{ exact: link.exact }"
                class="mox-header__link"
              >
                {{ link.label }}
              </a>
            }
          </nav>

          <div class="mox-header__actions">
            <button
              type="button"
              class="mox-header__icon-btn"
              (click)="toggleTheme()"
              [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <lucide-icon [img]="isDark() ? sunIcon : moonIcon" class="h-5 w-5" />
            </button>
            <button type="button" class="mox-header__icon-btn md:hidden" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
              <lucide-icon [img]="mobileOpen() ? closeIcon : menuIcon" class="h-5 w-5" />
            </button>
            <button type="button" class="mox-header__icon-btn" aria-label="Cart" (click)="cartOpen.set(true)">
              <lucide-icon [img]="cartIcon" class="h-5 w-5" />
              @if (cartCount() > 0) {
                <span class="mox-header__badge">{{ cartCount() }}</span>
              }
            </button>
          </div>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="border-t px-6 py-3 md:hidden" style="border-color: var(--mox-border)">
          @for (link of navLinks(); track link.label) {
            <a
              [routerLink]="link.path"
              routerLinkActive="mox-header__link--active"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="mox-header__link block py-2"
              (click)="mobileOpen.set(false)"
            >
              {{ link.label }}
            </a>
          }
        </div>
      }
    </header>
    <app-cart-drawer [open]="cartOpen()" (closed)="cartOpen.set(false)" />
  `,
  styles: `.store-nav--preview { margin-top: 2rem; }`
})
export class StoreNavComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly previewMode = input(false);
  readonly themeMode = input<PortfolioThemeMode>('light');

  private readonly cartState = inject(CartStateService);
  private readonly storeTheme = inject(StoreThemeService);

  readonly cartIcon = ShoppingCart;
  readonly menuIcon = Menu;
  readonly closeIcon = X;
  readonly moonIcon = Moon;
  readonly sunIcon = Sun;
  readonly mobileOpen = signal(false);
  readonly cartOpen = signal(false);
  readonly cartCount = computed(() => this.cartState.summary().itemCount);

  readonly navLinks = computed(() => {
    const base = ['/store', this.storeSlug()];
    return [
      { label: 'Home', path: base, exact: true },
      { label: 'Shop', path: [...base, 'products'], exact: false },
      { label: 'Contact', path: [...base, 'contact'], exact: true }
    ];
  });

  storeBase(): string[] {
    return ['/store', this.storeSlug()];
  }

  isDark(): boolean {
    this.storeTheme.visitorMode();
    return this.themeMode() === 'dark';
  }

  toggleTheme(): void {
    this.storeTheme.toggle();
  }
}
