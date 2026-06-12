import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioService } from './portfolio.service';
import { NotificationService } from '../../../core/notifications/notification.service';
import { AdminDashboardDataService } from '../../admin/services/admin-dashboard-data.service';

@Injectable({ providedIn: 'root' })
export class PortfolioStateService {
  private readonly portfolioService = inject(PortfolioService);
  private readonly notifications = inject(NotificationService);
  private readonly dashboardData = inject(AdminDashboardDataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly draft = signal<Portfolio | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly lastSavedAt = signal<Date | null>(null);

  readonly hasGalleryItems = computed(() => (this.draft()?.gallery.length ?? 0) > 0);

  constructor() {
    this.loadDraft();
  }

  loadDraft(): void {
    this.isLoading.set(true);
    this.portfolioService
      .getTenantDraft()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (portfolio) => {
          this.draft.set(portfolio);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  commitAndSave(partial: Partial<Portfolio>): Observable<Portfolio> {
    const current = this.draft();
    if (!current) {
      throw new Error('No draft loaded');
    }

    const next = this.mergePartial(current, partial);
    this.draft.set(next);

    if (this.isSaving()) {
      return new Observable((subscriber) => {
        subscriber.next(next);
        subscriber.complete();
      });
    }

    this.isSaving.set(true);
    return this.portfolioService.saveDraft(next).pipe(
      tap({
        next: (saved) => {
          this.draft.set(saved);
          this.isSaving.set(false);
          this.lastSavedAt.set(new Date());
          if (saved.gallery.length > 0) {
            this.dashboardData.markPortfolioUploaded();
          }
        },
        error: () => {
          this.isSaving.set(false);
        }
      })
    );
  }

  publish(): void {
    if (this.isSaving()) {
      return;
    }

    const current = this.draft();
    if (!current?.slug?.trim()) {
      this.notifications.warning('Set a store URL slug before publishing.');
      return;
    }
    this.isSaving.set(true);
    this.portfolioService
      .publish(current)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (published) => {
          this.draft.set(published);
          this.isSaving.set(false);
          this.lastSavedAt.set(new Date());
          this.notifications.success('Store published!', `Live at /store/${published.slug}`);
        },
        error: () => {
          this.isSaving.set(false);
          this.notifications.error('Could not publish store.');
        }
      });
  }

  private mergePartial(current: Portfolio, partial: Partial<Portfolio>): Portfolio {
    const next = structuredClone(current);
    if (partial.brand) next.brand = partial.brand;
    if (partial.hero) next.hero = partial.hero;
    if (partial.offerBanner) next.offerBanner = partial.offerBanner;
    if (partial.saleCollection) next.saleCollection = partial.saleCollection;
    if (partial.storeDescription) {
      next.storeDescription = partial.storeDescription;
      next.about = {
        ...next.about,
        enabled: partial.storeDescription.enabled,
        description: partial.storeDescription.description
      };
    }
    if (partial.gallerySection) next.gallerySection = partial.gallerySection;
    if (partial.gallery) next.gallery = partial.gallery;
    if (partial.featuredProducts) next.featuredProducts = partial.featuredProducts;
    if (partial.reviewsSection) next.reviewsSection = partial.reviewsSection;
    if (partial.reviews) next.reviews = partial.reviews;
    if (partial.contactSupport) {
      next.contactSupport = partial.contactSupport;
      next.contact = {
        ...next.contact,
        enabled: partial.contactSupport.enabled,
        email: partial.contactSupport.email,
        phone: partial.contactSupport.phone
      };
    }
    if (partial.paymentMethods) next.paymentMethods = partial.paymentMethods;
    if (partial.storePolicies) next.storePolicies = partial.storePolicies;
    if (partial.trustBadges) next.trustBadges = partial.trustBadges;
    if (partial.newsletter) next.newsletter = partial.newsletter;
    if (partial.highlights) next.highlights = partial.highlights;
    if (partial.socialSection) next.socialSection = partial.socialSection;
    if (partial.social) next.social = partial.social;
    if (partial.theme) next.theme = partial.theme;
    if (partial.slug !== undefined) next.slug = partial.slug;
    if (partial.cta) next.cta = partial.cta;
    if (partial.published !== undefined) next.published = partial.published;
    if (partial.about) next.about = partial.about;
    if (partial.contact) next.contact = partial.contact;
    return next;
  }
}
