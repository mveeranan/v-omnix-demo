import { Injectable, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
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
  readonly isDirty = signal(false);
  readonly lastSavedAt = signal<Date | null>(null);

  readonly hasGalleryItems = computed(() => (this.draft()?.gallery.length ?? 0) > 0);

  constructor() {
    this.loadDraft();
    this.setupAutosave();
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
          this.isDirty.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  patchDraft(updater: (current: Portfolio) => Portfolio): void {
    const current = this.draft();
    if (!current) return;
    const next = updater(structuredClone(current));
    this.draft.set(next);
    this.isDirty.set(true);
    if (next.gallery.length > 0) {
      this.dashboardData.markPortfolioUploaded();
    }
  }

  publish(): void {
    if (this.isSaving()) {
      return;
    }

    const current = this.draft();
    if (!current?.slug?.trim()) {
      this.notifications.warning('Set a portfolio URL slug before publishing.');
      return;
    }
    this.isSaving.set(true);
    this.portfolioService
      .publish(current)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (published) => {
          this.draft.set(published);
          this.isDirty.set(false);
          this.isSaving.set(false);
          this.lastSavedAt.set(new Date());
          this.notifications.success('Portfolio published!', `Live at /portfolio/${published.slug}`);
        },
        error: () => {
          this.isSaving.set(false);
          this.notifications.error('Could not publish portfolio.');
        }
      });
  }

  saveNow(): void {
    if (this.isSaving()) {
      return;
    }

    const current = this.draft();
    if (!current) return;
    this.isSaving.set(true);
    this.portfolioService
      .saveDraft(current)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.draft.set(saved);
          this.isDirty.set(false);
          this.isSaving.set(false);
          this.lastSavedAt.set(new Date());
        },
        error: () => this.isSaving.set(false)
      });
  }

  private setupAutosave(): void {
    toObservable(this.draft)
      .pipe(
        filter((d): d is Portfolio => d !== null),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        debounceTime(800),
        filter(() => this.isDirty()),
        tap(() => this.isSaving.set(true)),
        switchMap((portfolio) => this.portfolioService.saveDraft(portfolio)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (saved) => {
          this.draft.set(saved);
          this.isDirty.set(false);
          this.isSaving.set(false);
          this.lastSavedAt.set(new Date());
          // Silent autosave — status shown in editor header
        },
        error: () => this.isSaving.set(false)
      });
  }
}
