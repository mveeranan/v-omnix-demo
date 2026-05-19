import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Portfolio, createEmptyPortfolio } from '../models/portfolio.model';
import { PortfolioMapper } from './portfolio.mapper';
import { MOCK_PORTFOLIOS, DEFAULT_TENANT_DRAFT_SLUG } from './portfolio.mock';

const DRAFT_STORAGE_KEY = 'work-orbit.portfolio.draft';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly mapper = new PortfolioMapper();
  private readonly store = new Map<string, Portfolio>(
    MOCK_PORTFOLIOS.map((p) => [p.slug, structuredClone(p)])
  );

  getBySlug(slug: string, includeUnpublished = false): Observable<Portfolio> {
    const draft = this.loadDraftFromStorage();
    if (draft?.slug === slug && (includeUnpublished || draft.published)) {
      return of(structuredClone(draft)).pipe(delay(200));
    }

    const found = this.store.get(slug);
    if (!found) {
      return throwError(() => new Error('NOT_FOUND'));
    }
    if (!includeUnpublished && !found.published) {
      return throwError(() => new Error('NOT_FOUND'));
    }
    return of(structuredClone(found)).pipe(delay(200));
  }

  getTenantDraft(): Observable<Portfolio> {
    const stored = this.loadDraftFromStorage();
    if (stored) {
      return of(structuredClone(stored));
    }
    const empty = createEmptyPortfolio();
    empty.id = 'draft-1';
    empty.slug = DEFAULT_TENANT_DRAFT_SLUG;
    empty.brand.businessName = 'My Business';
    empty.brand.tagline = 'Your tagline here';
    return of(empty);
  }

  saveDraft(portfolio: Portfolio): Observable<Portfolio> {
    const updated = {
      ...structuredClone(portfolio),
      updatedAt: new Date().toISOString()
    };
    this.persistDraft(updated);
    if (updated.slug) {
      this.store.set(updated.slug, structuredClone(updated));
    }
    return of(updated).pipe(delay(300));
  }

  publish(portfolio: Portfolio): Observable<Portfolio> {
    const published = {
      ...structuredClone(portfolio),
      published: true,
      updatedAt: new Date().toISOString()
    };
    this.persistDraft(published);
    this.store.set(published.slug, structuredClone(published));
    return of(published).pipe(delay(400));
  }

  private loadDraftFromStorage(): Portfolio | null {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      const dto = JSON.parse(raw);
      return this.mapper.map(dto);
    } catch {
      return null;
    }
  }

  private persistDraft(portfolio: Portfolio): void {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(this.mapper.toDto(portfolio)));
  }
}
