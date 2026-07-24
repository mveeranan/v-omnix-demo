import { Directive, computed, inject, input, signal, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { Portfolio } from '../../../models/portfolio.model';

export interface FeedbackItem {
  id: string;
  authorName: string;
  authorRole: string | null;
  message: string;
  rating: number | null;
}

/**
 * Shared data logic for every Testimonials layout variant.
 *
 * Fetches store-level customer feedback for the given slug once, applies the
 * admin's item limit, and resolves the heading. Concrete layouts extend this
 * and provide only template + styles.
 */
@Directive()
export abstract class ReviewsSectionBase implements OnInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input<string>('');
  readonly enabled = input(true);

  protected readonly http = inject(HttpClient);
  protected readonly allFeedback = signal<FeedbackItem[]>([]);
  protected intervalId?: ReturnType<typeof setInterval>;

  protected get section() {
    return this.portfolio().reviewsSection;
  }

  /** Heading: admin's custom display name, else the original default. */
  get heading(): string {
    return this.section?.displayName?.trim() || 'What customers say';
  }

  private get limit(): number | undefined {
    return this.section?.itemLimit;
  }

  ngOnInit(): void {
    const slug = this.storeSlug();
    if (!slug || this.enabled() === false || this.section?.enabled === false) return;

    this.http
      .get<ApiResponse<FeedbackItem[]>>(API_ENDPOINTS.catalog.feedback(slug))
      .subscribe({
        next: (r) => {
          this.allFeedback.set(r.data ?? []);
          this.onFeedbackLoaded();
        },
        error: () => this.allFeedback.set([])
      });
  }

  /** Hook for subclasses that need to react once feedback has actually arrived (e.g. starting auto-rotation). */
  protected onFeedbackLoaded(): void {}

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  /** Feedback items sliced to the admin's item limit (undefined = show all fetched). */
  readonly feedbackItems = computed<FeedbackItem[]>(() => {
    const items = this.allFeedback();
    return this.limit ? items.slice(0, this.limit) : items;
  });
}
