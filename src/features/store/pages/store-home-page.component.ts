import { Component, inject } from '@angular/core';
import { HeroSectionComponent } from '../../portfolio/public/sections/hero-section.component';
import { NewsletterSignupSectionComponent } from '../commerce/newsletter-signup-section.component';
import { SectionRendererComponent } from '../section-layout/section-renderer.component';
import { StoreContextService } from '../data-access/store-context.service';

/**
 * Store home page — hero -> trust strip -> new arrivals -> categories ->
 * deal of week -> featured products -> reviews -> gallery -> newsletter.
 * One design, wired entirely to real portfolio/catalog data.
 */
@Component({
  selector: 'app-store-home-page',
  standalone: true,
  imports: [
    HeroSectionComponent,
    SectionRendererComponent,
    NewsletterSignupSectionComponent
  ],
  template: `
    @if (portfolio(); as p) {
      @if (p.hero.enabled) {
        <app-pf-hero-section [portfolio]="p" />
      }

      <app-section-renderer sectionKey="trustBadges" [portfolio]="p" [storeSlug]="ctx.slug()" />

      <app-section-renderer sectionKey="newArrivals" [portfolio]="p" [storeSlug]="ctx.slug()" />

      @if (p.categoryShowcase.enabled) {
        <app-section-renderer sectionKey="categoryShowcase" [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      <app-section-renderer sectionKey="dealOfWeek" [portfolio]="p" [storeSlug]="ctx.slug()" />

      @if (p.featuredProducts.enabled) {
        <app-section-renderer sectionKey="featuredProducts" [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      @if (p.reviewsSection.enabled) {
        <app-section-renderer sectionKey="reviewsSection" [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      @if (p.gallerySection.enabled) {
        <app-section-renderer sectionKey="gallerySection" [portfolio]="p" [storeSlug]="ctx.slug()" />
      }

      <app-newsletter-signup-section [portfolio]="p" />
    }
  `
})
export class StoreHomePageComponent {
  readonly ctx = inject(StoreContextService);
  readonly portfolio = this.ctx.portfolio;
}
