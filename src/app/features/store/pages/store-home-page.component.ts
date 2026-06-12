import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroSectionComponent } from '../../portfolio/public/sections/hero-section.component';
import { AboutSectionComponent } from '../../portfolio/public/sections/about-section.component';
import { HighlightsSectionComponent } from '../../portfolio/public/sections/highlights-section.component';
import { ReviewsSectionComponent } from '../../portfolio/public/sections/reviews-section.component';
import { FeaturedProductsSectionComponent } from '../commerce/featured-products-section.component';
import { OfferBannerSectionComponent } from '../commerce/offer-banner-section.component';
import { SaleCollectionSectionComponent } from '../commerce/sale-collection-section.component';
import { NewsletterSignupSectionComponent } from '../commerce/newsletter-signup-section.component';
import { ContactSectionComponent } from '../commerce/contact-section.component';
import { StoreContextService } from '../data-access/store-context.service';

/**
 * Marketing landing page — every block respects portfolio section enabled flags
 * configured in /admin/website. Full catalog, cart, and checkout live under /products, /cart.
 */
@Component({
  selector: 'app-store-home-page',
  standalone: true,
  imports: [
    RouterLink,
    HeroSectionComponent,
    AboutSectionComponent,
    FeaturedProductsSectionComponent,
    OfferBannerSectionComponent,
    SaleCollectionSectionComponent,
    ReviewsSectionComponent,
    HighlightsSectionComponent,
    NewsletterSignupSectionComponent,
    ContactSectionComponent
  ],
  template: `
    @if (portfolio(); as p) {
      @if (p.hero.enabled) {
        <app-pf-hero-section [portfolio]="p" />
      }

      @if (p.storeDescription.enabled) {
        <app-pf-about-section [portfolio]="p" mode="summary" />
      }

      @if (p.featuredProducts.enabled) {
        <app-featured-products-section
          [portfolio]="p"
          [storeSlug]="ctx.slug()"
          [enabled]="true"
          [maxCount]="p.featuredProducts.maxCount"
          [productIds]="p.featuredProducts.productIds"
          [promoMarquee]="p.featuredProducts.promoMarqueeText"
          [showQtyControls]="false"
          [showShopCta]="true"
        />
      }

      @if (p.offerBanner.enabled) {
        <app-offer-banner-section [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      @if (p.reviewsSection.enabled && p.reviews.length) {
        <app-pf-reviews-section [portfolio]="p" />
      }

      @if (p.highlights.enabled && p.highlights.items.length) {
        <app-pf-highlights-section [portfolio]="p" />
      }

      @if (p.saleCollection.enabled) {
        <app-sale-collection-section [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      @if (p.newsletter.enabled) {
        <app-newsletter-signup-section [portfolio]="p" />
      }

      @if (p.contactSupport.enabled) {
        <app-store-contact-section [portfolio]="p" variant="compact" />
      }

      <section class="mk-section border-t" style="border-color: var(--mk-border)">
        <div class="container mx-auto px-6 text-center">
          <h2 class="mk-sale-section__title">Ready to shop?</h2>
          <p class="mk-sale-section__subtitle mt-2">Browse our full catalog, add items to cart, and checkout securely.</p>
          <a [routerLink]="shopLink()" class="mk-btn mk-btn--primary mt-6 inline-flex">Go to shop</a>
        </div>
      </section>
    }
  `
})
export class StoreHomePageComponent {
  readonly ctx = inject(StoreContextService);
  readonly portfolio = this.ctx.portfolio;

  shopLink(): string[] {
    return ['/store', this.ctx.slug(), 'products'];
  }
}
