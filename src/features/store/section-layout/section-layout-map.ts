import { Type } from '@angular/core';
import { CategoryShowcaseSectionComponent } from '../commerce/category-showcase-section.component';
import { CategoryScrollCardsComponent } from '../commerce/category-layouts/category-scroll-cards.component';
import { CategoryCircularCardsComponent } from '../commerce/category-layouts/category-circular-cards.component';
import { CategoryIconGridComponent } from '../commerce/category-layouts/category-icon-grid.component';
import { CategoryLargeBannerComponent } from '../commerce/category-layouts/category-large-banner.component';
import { CategoryMasonryComponent } from '../commerce/category-layouts/category-masonry.component';
import { CategoryCarouselComponent } from '../commerce/category-layouts/category-carousel.component';
import { CategoryListComponent } from '../commerce/category-layouts/category-list.component';
import { FeaturedProductsGridComponent } from '../commerce/product-layouts/featured-products-grid.component';
import { FeaturedProductsCarouselComponent } from '../commerce/product-layouts/featured-products-carousel.component';
import { FeaturedProductsCompactListComponent } from '../commerce/product-layouts/featured-products-compact-list.component';
import { FeaturedProductsHeroGridComponent } from '../commerce/product-layouts/featured-products-hero-grid.component';
import { FeaturedProductsMasonryComponent } from '../commerce/product-layouts/featured-products-masonry.component';
import { NewArrivalsGridComponent } from '../commerce/new-arrivals-layouts/new-arrivals-grid.component';
import { NewArrivalsCarouselComponent } from '../commerce/new-arrivals-layouts/new-arrivals-carousel.component';
import { NewArrivalsCompactListComponent } from '../commerce/new-arrivals-layouts/new-arrivals-compact-list.component';
import { NewArrivalsSideNavSliderComponent } from '../commerce/new-arrivals-layouts/new-arrivals-side-nav-slider.component';
import { NewArrivalsMasonryComponent } from '../commerce/new-arrivals-layouts/new-arrivals-masonry.component';
import { GallerySectionComponent } from '../../portfolio/public/sections/gallery-section.component';
import { GalleryMasonryComponent } from '../../portfolio/public/sections/gallery-layouts/gallery-masonry.component';
import { GalleryCarouselComponent } from '../../portfolio/public/sections/gallery-layouts/gallery-carousel.component';
import { GalleryBorderedCardsComponent } from '../../portfolio/public/sections/gallery-layouts/gallery-bordered-cards.component';
import { GallerySlideshowComponent } from '../../portfolio/public/sections/gallery-layouts/gallery-slideshow.component';
import { ReviewsSectionComponent } from '../../portfolio/public/sections/reviews-section.component';
import { ReviewsCardGridComponent } from '../../portfolio/public/sections/reviews-layouts/reviews-card-grid.component';
import { ReviewsCarouselComponent } from '../../portfolio/public/sections/reviews-layouts/reviews-carousel.component';
import { ReviewsSideBySideComponent } from '../../portfolio/public/sections/reviews-layouts/reviews-side-by-side.component';
import { ReviewsMarqueeComponent } from '../../portfolio/public/sections/reviews-layouts/reviews-marquee.component';
import { TrustBadgesStripComponent } from '../commerce/trust-badges-strip.component';
import { TrustBadgesIconGridComponent } from '../commerce/trust-badges-layouts/trust-badges-icon-grid.component';
import { TrustBadgesBorderedCardsComponent } from '../commerce/trust-badges-layouts/trust-badges-bordered-cards.component';
import { TrustBadgesTextListComponent } from '../commerce/trust-badges-layouts/trust-badges-text-list.component';
import { TrustBadgesNumberedStepsComponent } from '../commerce/trust-badges-layouts/trust-badges-numbered-steps.component';
import { DealOfWeekSectionComponent } from '../commerce/deal-of-week-section.component';
import { DealOfWeekSpotlightComponent } from '../commerce/deal-of-week-layouts/deal-of-week-spotlight.component';
import { DealOfWeekCompactListComponent } from '../commerce/deal-of-week-layouts/deal-of-week-compact-list.component';
import { DealOfWeekGridCardsComponent } from '../commerce/deal-of-week-layouts/deal-of-week-grid-cards.component';
import { DealOfWeekMinimalBarComponent } from '../commerce/deal-of-week-layouts/deal-of-week-minimal-bar.component';

/**
 * Maps `${sectionKey}:${layoutStyleId}` → the Angular component that renders it.
 *
 * Adding a layout style = one new component + one entry here. The rendering
 * engine (section-renderer.component) never changes; nor does the DB or API.
 */
export const SECTION_LAYOUT_MAP: Record<string, Type<unknown>> = {
  'categoryShowcase:image-grid': CategoryShowcaseSectionComponent,
  'categoryShowcase:horizontal-scroll': CategoryScrollCardsComponent,
  'categoryShowcase:circular-cards': CategoryCircularCardsComponent,
  'categoryShowcase:icon-grid': CategoryIconGridComponent,
  'categoryShowcase:large-banner': CategoryLargeBannerComponent,
  'categoryShowcase:masonry': CategoryMasonryComponent,
  'categoryShowcase:carousel': CategoryCarouselComponent,
  'categoryShowcase:list': CategoryListComponent,
  'featuredProducts:standard-grid': FeaturedProductsGridComponent,
  'featuredProducts:carousel': FeaturedProductsCarouselComponent,
  'featuredProducts:compact-list': FeaturedProductsCompactListComponent,
  'featuredProducts:hero-grid': FeaturedProductsHeroGridComponent,
  'featuredProducts:masonry': FeaturedProductsMasonryComponent,
  'newArrivals:grid': NewArrivalsGridComponent,
  'newArrivals:carousel': NewArrivalsCarouselComponent,
  'newArrivals:compact-list': NewArrivalsCompactListComponent,
  'newArrivals:side-nav-slider': NewArrivalsSideNavSliderComponent,
  'newArrivals:masonry': NewArrivalsMasonryComponent,
  'gallerySection:instagram-grid': GallerySectionComponent,
  'gallerySection:masonry': GalleryMasonryComponent,
  'gallerySection:carousel': GalleryCarouselComponent,
  'gallerySection:bordered-cards': GalleryBorderedCardsComponent,
  'gallerySection:slideshow': GallerySlideshowComponent,
  'reviewsSection:spotlight': ReviewsSectionComponent,
  'reviewsSection:card-grid': ReviewsCardGridComponent,
  'reviewsSection:carousel': ReviewsCarouselComponent,
  'reviewsSection:side-by-side': ReviewsSideBySideComponent,
  'reviewsSection:marquee': ReviewsMarqueeComponent,
  'trustBadges:icon-row': TrustBadgesStripComponent,
  'trustBadges:icon-grid': TrustBadgesIconGridComponent,
  'trustBadges:bordered-cards': TrustBadgesBorderedCardsComponent,
  'trustBadges:text-list': TrustBadgesTextListComponent,
  'trustBadges:numbered-steps': TrustBadgesNumberedStepsComponent,
  'dealOfWeek:carousel': DealOfWeekSectionComponent,
  'dealOfWeek:spotlight': DealOfWeekSpotlightComponent,
  'dealOfWeek:compact-list': DealOfWeekCompactListComponent,
  'dealOfWeek:grid-cards': DealOfWeekGridCardsComponent,
  'dealOfWeek:minimal-bar': DealOfWeekMinimalBarComponent
};

/** Look up the component for a section key + resolved style id, if registered. */
export function resolveLayoutComponent(
  sectionKey: string,
  styleId: string
): Type<unknown> | null {
  return SECTION_LAYOUT_MAP[`${sectionKey}:${styleId}`] ?? null;
}
