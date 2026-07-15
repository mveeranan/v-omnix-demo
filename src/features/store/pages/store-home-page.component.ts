import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroSectionComponent } from '../../portfolio/public/sections/hero-section.component';
import { ReviewsSectionComponent as PortfolioReviewsComponent } from '../../portfolio/public/sections/reviews-section.component';
import { FeaturedProductsSectionComponent } from '../commerce/featured-products-section.component';
import { NewArrivalsSectionComponent } from '../commerce/new-arrivals-section.component';
import { CategoryShowcaseSectionComponent } from '../commerce/category-showcase-section.component';
import { TrustBadgesStripComponent } from '../commerce/trust-badges-strip.component';
import { DealOfWeekSectionComponent } from '../commerce/deal-of-week-section.component';
import { ProductReviewsSectionComponent } from '../commerce/product-reviews-section.component';
import { StoreContextService } from '../data-access/store-context.service';

/**
 * Store home page — hero -> trust strip -> new arrivals -> categories ->
 * deal of week -> featured products -> reviews.
 * One design, wired entirely to real portfolio/catalog data.
 */
@Component({
  selector: 'app-store-home-page',
  standalone: true,
  imports: [
    RouterLink,
    HeroSectionComponent,
    TrustBadgesStripComponent,
    NewArrivalsSectionComponent,
    CategoryShowcaseSectionComponent,
    DealOfWeekSectionComponent,
    FeaturedProductsSectionComponent,
    ProductReviewsSectionComponent,
    PortfolioReviewsComponent
  ],
  template: `
    @if (portfolio(); as p) {
      @if (p.hero.enabled) {
        <app-pf-hero-section [portfolio]="p" />
      }

      <app-trust-badges-strip [portfolio]="p" />

      <app-new-arrivals-section [portfolio]="p" [storeSlug]="ctx.slug()" />

      @if (p.categoryShowcase.enabled) {
        <app-category-showcase-section [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      <app-deal-of-week-section />

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

      @if (p.reviewsSection?.enabled) {
        <app-product-reviews-section />
      }

      @if (p.reviewsSection.enabled) {
        <app-pf-reviews-section [storeSlug]="ctx.slug()" />
      }
    }
  `
})
export class StoreHomePageComponent {
  readonly ctx = inject(StoreContextService);
  readonly portfolio = this.ctx.portfolio;
}
