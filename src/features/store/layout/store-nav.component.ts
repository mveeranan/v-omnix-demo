import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Menu, X, ShoppingCart, Moon, Sun, Search } from 'lucide-angular';
import { Portfolio, PortfolioThemeMode } from '../../portfolio/models/portfolio.model';
import { CartStateService } from '../data-access/cart-state.service';
import { StoreThemeService } from '../data-access/store-theme.service';
import { CartDrawerComponent } from '../commerce/cart-drawer.component';

/**
 * Minishop-style store header: brand left, uppercase nav center,
 * search + theme + cart right. Search navigates to the shop page
 * with ?q= so results are server-filtered across the whole catalog.
 */
@Component({
  selector: 'app-store-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, LucideAngularModule, CartDrawerComponent],
  template: `
    <header class="msp-header store-nav" [class.store-nav--preview]="previewMode()">
      <div class="container mx-auto px-6">
        <div class="msp-header__inner">
          <a [routerLink]="storeBase()" class="msp-header__brand">
            @if (portfolio().brand.logoUrl) {
              <img [src]="portfolio().brand.logoUrl" alt="" class="msp-header__logo" />
            }
            <span>{{ portfolio().brand.businessName || 'Store' }}</span>
          </a>

          <nav class="msp-header__nav" aria-label="Main">
            @for (link of navLinks(); track link.label) {
              <a
                [routerLink]="link.path"
                routerLinkActive="msp-header__link--active"
                [routerLinkActiveOptions]="{ exact: link.exact }"
                class="msp-header__link"
              >
                {{ link.label }}
              </a>
            }
          </nav>

          <div class="msp-header__actions">
            <form class="msp-header__search" (submit)="onSearch($event)" role="search">
              <lucide-icon [img]="searchIcon" class="msp-header__search-icon h-4 w-4" />
              <input
                type="search"
                name="q"
                class="msp-header__search-input"
                placeholder="Search products…"
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                aria-label="Search products"
              />
            </form>

            <button
              type="button"
              class="msp-header__icon-btn"
              (click)="toggleTheme()"
              [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <lucide-icon [img]="isDark() ? sunIcon : moonIcon" class="h-5 w-5" />
            </button>
            <button type="button" class="msp-header__icon-btn md:hidden" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
              <lucide-icon [img]="mobileOpen() ? closeIcon : menuIcon" class="h-5 w-5" />
            </button>
            <button type="button" class="msp-header__icon-btn" aria-label="Cart" (click)="cartOpen.set(true)">
              <lucide-icon [img]="cartIcon" class="h-5 w-5" />
              @if (cartCount() > 0) {
                <span class="msp-header__badge">{{ cartCount() }}</span>
              }
            </button>
          </div>
        </div>
      </div>

      @if (mobileOpen()) {
        <div class="msp-header__mobile md:hidden">
          <form class="msp-header__search msp-header__search--mobile" (submit)="onSearch($event)" role="search">
            <lucide-icon [img]="searchIcon" class="msp-header__search-icon h-4 w-4" />
            <input
              type="search"
              name="q"
              class="msp-header__search-input"
              placeholder="Search products…"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              aria-label="Search products"
            />
          </form>
          @for (link of navLinks(); track link.label) {
            <a
              [routerLink]="link.path"
              routerLinkActive="msp-header__link--active"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="msp-header__link msp-header__link--mobile"
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
  styles: `
    .store-nav--preview { margin-top: 2rem; }

    .msp-header {
      position: sticky;
      top: 0;
      z-index: 40;
      background: var(--mox-surface, #fff);
      border-bottom: 1px solid var(--mox-border, #eaeaea);
    }
    .msp-header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      min-height: 4.25rem;
    }

    .msp-header__brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: var(--mox-font-heading, inherit);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--mox-text, #23232d);
      text-decoration: none;
      white-space: nowrap;
    }
    .msp-header__logo {
      height: 2rem;
      width: auto;
      object-fit: contain;
    }

    .msp-header__nav {
      display: none;
      align-items: center;
      gap: 1.75rem;
    }
    @media (min-width: 768px) {
      .msp-header__nav { display: flex; }
    }
    .msp-header__link {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mox-text, #23232d);
      text-decoration: none;
      padding: 0.4rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    .msp-header__link:hover,
    .msp-header__link--active {
      color: var(--mox-accent, #fe4c50);
      border-bottom-color: var(--mox-accent, #fe4c50);
    }

    .msp-header__actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .msp-header__search {
      position: relative;
      display: none;
      align-items: center;
    }
    @media (min-width: 1024px) {
      .msp-header__search { display: flex; }
    }
    .msp-header__search--mobile {
      display: flex;
      margin-bottom: 0.75rem;
    }
    .msp-header__search-icon {
      position: absolute;
      left: 0.7rem;
      color: var(--mox-muted, #8a8a8a);
      pointer-events: none;
    }
    .msp-header__search-input {
      width: 13rem;
      padding: 0.45rem 0.8rem 0.45rem 2.2rem;
      font-size: 0.85rem;
      color: var(--mox-text, #23232d);
      background: color-mix(in srgb, var(--mox-border, #eaeaea) 25%, var(--mox-surface, #fff));
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-btn-radius, 2px);
      outline: none;
      transition: border-color 0.2s ease, width 0.25s ease;
    }
    .msp-header__search--mobile .msp-header__search-input { width: 100%; }
    .msp-header__search-input:focus {
      border-color: var(--mox-accent, #fe4c50);
      width: 16rem;
    }
    .msp-header__search--mobile .msp-header__search-input:focus { width: 100%; }
    .msp-header__search-input::placeholder { color: var(--mox-muted, #8a8a8a); }

    .msp-header__icon-btn {
      position: relative;
      display: grid;
      place-items: center;
      width: 2.4rem;
      height: 2.4rem;
      color: var(--mox-text, #23232d);
      background: transparent;
      border: none;
      border-radius: var(--mox-btn-radius, 2px);
      cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease;
    }
    .msp-header__icon-btn:hover {
      color: var(--mox-accent, #fe4c50);
      background: color-mix(in srgb, var(--mox-accent, #fe4c50) 8%, transparent);
    }
    .msp-header__badge {
      position: absolute;
      top: 0.1rem;
      right: 0.1rem;
      min-width: 1.05rem;
      height: 1.05rem;
      display: grid;
      place-items: center;
      padding: 0 0.25rem;
      font-size: 0.62rem;
      font-weight: 700;
      color: #fff;
      background: var(--mox-accent, #fe4c50);
      border-radius: 999px;
    }

    .msp-header__mobile {
      padding: 0.9rem 1.5rem 1.1rem;
      border-top: 1px solid var(--mox-border, #eaeaea);
      background: var(--mox-surface, #fff);
    }
    .msp-header__link--mobile {
      display: block;
      padding: 0.55rem 0;
      border-bottom: none;
    }
  `
})
export class StoreNavComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly previewMode = input(false);
  readonly themeMode = input<PortfolioThemeMode>('light');

  private readonly cartState = inject(CartStateService);
  private readonly storeTheme = inject(StoreThemeService);
  private readonly router = inject(Router);

  readonly cartIcon = ShoppingCart;
  readonly menuIcon = Menu;
  readonly closeIcon = X;
  readonly moonIcon = Moon;
  readonly sunIcon = Sun;
  readonly searchIcon = Search;

  readonly mobileOpen = signal(false);
  readonly cartOpen = signal(false);
  readonly searchTerm = signal('');
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

  onSearch(event: Event): void {
    event.preventDefault();
    const q = this.searchTerm().trim();
    this.mobileOpen.set(false);
    this.router.navigate(['/store', this.storeSlug(), 'products'], {
      queryParams: { q: q || null }
    });
  }

  isDark(): boolean {
    this.storeTheme.visitorMode();
    return this.themeMode() === 'dark';
  }

  toggleTheme(): void {
    this.storeTheme.toggle();
  }
}
