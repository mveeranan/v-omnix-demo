import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioMapper } from './portfolio.mapper';
import { createDefaultWebsitePortfolio, mergeWithWebsiteDefaults } from '../models/portfolio-defaults';

const DRAFT_STORAGE_KEY = 'work-orbit.portfolio.draft';

/** Client-side draft cache for the website editor (server source of truth is PortfolioApiService). */
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly mapper = new PortfolioMapper();

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
    return of(updated);
  }

  private loadDraftFromStorage(): Portfolio | null {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return null;
      }
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
