import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioMapper } from './portfolio.mapper';
import { MOCK_PORTFOLIOS } from './portfolio.mock';
import {
  DEFAULT_TENANT_DRAFT_SLUG,
  createDefaultWebsitePortfolio,
  mergeWithWebsiteDefaults
} from '../models/portfolio-defaults';

const DRAFT_STORAGE_KEY = 'work-orbit.portfolio.draft';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly mapper = new PortfolioMapper();
  private readonly store = (() => {
    const map = new Map<string, Portfolio>(
      MOCK_PORTFOLIOS.map((p) => [p.slug, structuredClone(p)])
    );
    map.set(DEFAULT_TENANT_DRAFT_SLUG, structuredClone(createDefaultWebsitePortfolio()));
    return map;
  })();

  getBySlug(slug: string, includeUnpublished = false): Observable<Portfolio> {
    const draft = this.loadDraftFromStorage();
    if (draft?.slug === slug && (includeUnpublished || draft.published)) {
      return of(mergeWithWebsiteDefaults(structuredClone(draft))).pipe(delay(200));
    }

    let found = this.store.get(slug);
    if (!found && slug === DEFAULT_TENANT_DRAFT_SLUG) {
      found = createDefaultWebsitePortfolio();
    }
    if (!found) {
      return throwError(() => new Error('NOT_FOUND'));
    }
    if (!includeUnpublished && !found.published) {
      return throwError(() => new Error('NOT_FOUND'));
    }
    return of(mergeWithWebsiteDefaults(structuredClone(found))).pipe(delay(200));
  }

  getTenantDraft(): Observable<Portfolio> {
    const stored = this.loadDraftFromStorage();
    if (stored) {
      return of(mergeWithWebsiteDefaults(structuredClone(stored)));
    }
    return of(createDefaultWebsitePortfolio());
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
