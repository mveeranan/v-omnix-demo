import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shop-storefront',
  standalone: true,
  template: `
    <div class="shop-storefront">
      <p class="shop-storefront__eyebrow">Storefront</p>
      <h1 class="shop-storefront__title">{{ displayName() }}</h1>
      <p class="shop-storefront__message">Online store coming soon.</p>
      <p class="shop-storefront__slug">/shop/{{ slug() }}</p>
    </div>
  `,
  styles: `
    .shop-storefront {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      background: var(--bg-primary, #fafafa);
      color: var(--text-primary, #18181b);
    }
    .shop-storefront__eyebrow {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted, #71717a);
    }
    .shop-storefront__title {
      margin-top: 0.5rem;
      font-size: 1.875rem;
      font-weight: 600;
    }
    .shop-storefront__message {
      margin-top: 0.75rem;
      font-size: 0.9375rem;
      color: var(--text-secondary, #52525b);
    }
    .shop-storefront__slug {
      margin-top: 1.5rem;
      font-size: 0.8125rem;
      font-family: ui-monospace, monospace;
      color: var(--text-muted, #71717a);
    }
  `
})
export class ShopStorefrontComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly slug = signal('');

  readonly displayName = computed(() => {
    const value = this.slug().trim();
    if (!value) {
      return 'Your store';
    }
    return value
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  });

  ngOnInit(): void {
    this.slug.set(this.route.snapshot.paramMap.get('slug') ?? '');
  }
}
