import { Component, computed, inject } from '@angular/core';
import { dedupeHomeProductIds } from '../utils/home-product-dedup.util';

import { RouterLink } from '@angular/router';

import { HeroSectionComponent } from '../../portfolio/public/sections/hero-section.component';

import { AboutSectionComponent } from '../../portfolio/public/sections/about-section.component';

import { HighlightsSectionComponent } from '../../portfolio/public/sections/highlights-section.component';

import { ReviewsSectionComponent } from '../../portfolio/public/sections/reviews-section.component';

import { StatsSectionComponent } from '../../portfolio/public/sections/stats-section.component';

import { FeaturedProductsSectionComponent } from '../commerce/featured-products-section.component';

import { OfferBannerSectionComponent } from '../commerce/offer-banner-section.component';

import { SaleCollectionSectionComponent } from '../commerce/sale-collection-section.component';

import { NewsletterSignupSectionComponent } from '../commerce/newsletter-signup-section.component';

import { ContactSectionComponent } from '../commerce/contact-section.component';

import { CategoryShowcaseSectionComponent } from '../commerce/category-showcase-section.component';

import { PromoStripSectionComponent } from '../commerce/promo-strip-section.component';

import { StorePoliciesSectionComponent } from '../commerce/store-policies-section.component';

import { TrustBadgesStripComponent } from '../commerce/trust-badges-strip.component';

import { PaymentMethodsBarComponent } from '../commerce/payment-methods-bar.component';

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

    CategoryShowcaseSectionComponent,

    AboutSectionComponent,

    FeaturedProductsSectionComponent,

    OfferBannerSectionComponent,

    SaleCollectionSectionComponent,

    ReviewsSectionComponent,

    HighlightsSectionComponent,

    StatsSectionComponent,

    NewsletterSignupSectionComponent,

    ContactSectionComponent,

    PromoStripSectionComponent,

    StorePoliciesSectionComponent,

    TrustBadgesStripComponent,

    PaymentMethodsBarComponent

  ],

  template: `

    @if (portfolio(); as p) {

      @if (p.hero.enabled) {

        <app-pf-hero-section [portfolio]="p" />

      }



      @if (p.categoryShowcase.enabled) {

        <app-category-showcase-section [portfolio]="p" [storeSlug]="ctx.slug()" />

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

          [productIds]="homeProductIds().featured"

          [promoMarquee]="p.featuredProducts.promoMarqueeText"

          [showQtyControls]="false"

          [showShopCta]="true"

        />

      }



      @if (p.offerBanner.enabled) {

        <app-offer-banner-section
          [portfolio]="p"
          [storeSlug]="ctx.slug()"
          [productIds]="homeProductIds().offer"
        />

      }



      @if (p.saleCollection.enabled) {

        <app-sale-collection-section
          [portfolio]="p"
          [storeSlug]="ctx.slug()"
          [productIds]="homeProductIds().sale"
        />

      }



      @if (p.reviewsSection.enabled) {

        <app-pf-reviews-section [portfolio]="p" />

      }



      @if (p.highlights.enabled && p.highlights.items.length) {

        <app-pf-highlights-section [portfolio]="p" />

      }



      @if (p.stats.enabled) {

        <app-pf-stats-section [portfolio]="p" />

      }



      @if (p.newsletter.enabled) {

        <app-newsletter-signup-section [portfolio]="p" />

      }



      @if (p.contactSupport.enabled) {

        <app-store-contact-section [portfolio]="p" variant="compact" />

      }



      @if (p.storePolicies.enabled) {

        <app-store-policies-section [portfolio]="p" />

      }



      @if (p.trustBadges.enabled) {

        <app-trust-badges-strip [portfolio]="p" />

      }



      @if (p.paymentMethods.enabled) {

        <app-payment-methods-bar [portfolio]="p" />

      }



      @if (p.promoStrip.enabled) {

        <app-promo-strip-section [portfolio]="p" [storeSlug]="ctx.slug()" />

      }



      <section class="mox-section border-t" style="border-color: var(--mox-border)">

        <div class="container mx-auto px-6 text-center">

          <h2 class="mox-sale-section__title">Ready to shop?</h2>

          <p class="mox-sale-section__subtitle mt-2">Browse our full catalog, add items to cart, and checkout securely.</p>

          <a [routerLink]="shopLink()" class="mox-btn mox-btn--primary mt-6 inline-flex">Go to shop</a>

        </div>

      </section>

    }

  `

})

export class StoreHomePageComponent {

  readonly ctx = inject(StoreContextService);

  readonly portfolio = this.ctx.portfolio;

  readonly homeProductIds = computed(() => {
    const p = this.portfolio();
    if (!p) return { featured: [] as string[], offer: [] as string[], sale: [] as string[] };
    return dedupeHomeProductIds(
      p.featuredProducts.productIds,
      p.offerBanner.productIds,
      p.saleCollection.productIds,
      {
        featuredMax: p.featuredProducts.maxCount,
        offerMax: 2,
        saleMax: p.saleCollection.maxCount
      }
    );
  });



  shopLink(): string[] {

    return ['/store', this.ctx.slug(), 'products'];

  }

}

