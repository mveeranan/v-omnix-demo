import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Menu, X, ShoppingCart, Moon, Sun, Search, Phone, Mail, Truck } from 'lucide-angular';
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
    @if (showTopbar()) {
      <div class="msp-topbar">
        <div class="container mx-auto px-6 msp-topbar__inner">
          <div class="msp-topbar__left">
            @if (portfolio().contactSupport.phone) {
              <a [href]="'tel:' + portfolio().contactSupport.phone" class="msp-topbar__item">
                <lucide-icon [img]="phoneIcon" class="msp-topbar__icon" />
                {{ portfolio().contactSupport.phone }}
              </a>
            }
            @if (portfolio().contactSupport.email) {
              <a [href]="'mailto:' + portfolio().contactSupport.email" class="msp-topbar__item">
                <lucide-icon [img]="mailIcon" class="msp-topbar__icon" />
                {{ portfolio().contactSupport.email }}
              </a>
            }
          </div>
          <div class="msp-topbar__right">
            <span class="msp-topbar__item">
              <lucide-icon [img]="truckIcon" class="msp-topbar__icon" />
              {{ deliveryText() }}
            </span>
          </div>
        </div>
      </div>
    }
    <header
      class="msp-header store-nav"
      [class.store-nav--preview]="previewMode()"
    >
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
            <button type="button" class="msp-header__icon-btn msp-header__menu-btn" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
              <lucide-icon [img]="mobileOpen() ? closeIcon : menuIcon" class="h-5 w-5" />
            </button>
            <button type="button" class="msp-header__cart-btn" aria-label="Cart" (click)="cartOpen.set(true)">
              <lucide-icon [img]="cartIcon" class="h-5 w-5" />
              <span class="msp-header__cart-count">[{{ cartCount() }}]</span>
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

    .msp-topbar {
      background: var(--mox-primary, #000);
      color: rgba(255, 255, 255, 0.7);
      padding: 0.5rem 0;
    }
    .msp-topbar__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 2.2rem;
      font-size: 0.75rem;
    }
    .msp-topbar__left { display: flex; align-items: center; gap: 2rem; }
    .msp-topbar__right { display: none; }
    @media (min-width: 640px) {
      .msp-topbar__right { display: flex; align-items: center; }
    }
    .msp-topbar__item {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      color: rgba(255, 255, 255, 0.75);
      text-decoration: none;
      transition: color 0.2s ease;
      line-height: 1.4;
      height: 100%;
    }
    .msp-topbar__icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    a.msp-topbar__item:hover { color: var(--mox-accent, #dbcc8f); }

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
      gap: 2.25rem;
    }
    @media (min-width: 768px) {
      .msp-header__nav { display: flex; }
    }
    .msp-header__link {
      font-size: 0.775rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--mox-text, #23232d);
      text-decoration: none;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.25s ease, border-color 0.25s ease;
      position: relative;
    }
    .msp-header__link:hover,
    .msp-header__link--active {
      color: var(--mox-accent, #c9a24a);
      border-bottom-color: var(--mox-accent, #c9a24a);
    }

    .msp-header__actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Menu icon: show on mobile, hide on tablet+.
       Uses a compound selector for the hide rule so it out-specifies the
       base .msp-header__icon-btn { display: grid } rule that follows below. */
    .msp-header__menu-btn {
      display: grid;
    }
    @media (min-width: 768px) {
      .msp-header__icon-btn.msp-header__menu-btn {
        display: none;
      }
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
    .msp-header__cart-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      height: 2.4rem;
      padding: 0 0.6rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--mox-text, #23232d);
      background: transparent;
      border: none;
      border-radius: var(--mox-btn-radius, 2px);
      cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease;
    }
    .msp-header__cart-btn:hover {
      color: var(--mox-accent, #fe4c50);
      background: color-mix(in srgb, var(--mox-accent, #fe4c50) 8%, transparent);
    }
    .msp-header__cart-count { font-variant-numeric: tabular-nums; }

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
  readonly phoneIcon = Phone;
  readonly mailIcon = Mail;
  readonly truckIcon = Truck;

  readonly mobileOpen = signal(false);
  readonly cartOpen = signal(false);
  readonly searchTerm = signal('');
  readonly cartCount = computed(() => this.cartState.summary().itemCount);

  readonly deliveryText = computed(() => {
    const policies = this.portfolio().storePolicies;
    const delivery = policies?.deliveryTime?.trim();
    const shipping = policies?.shippingInfo?.trim();
    if (delivery && shipping) return `${delivery} — ${shipping}`;
    return delivery || shipping || 'Free shipping & easy returns';
  });

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

  showTopbar(): boolean {
    const p = this.portfolio();
    return !!(p.contactSupport.phone || p.contactSupport.email);
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
