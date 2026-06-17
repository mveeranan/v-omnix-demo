import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { BusinessProfileDto } from '@features/admin/models/business-profile.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioMapper } from './portfolio.mapper';
import {
  PortfolioApiDto,
  extractBusinessProfileFromPortfolio,
  extractPortfolioDraftFromApi,
  extractPresetIdFromPortfolio,
  extractUserFromPortfolio
} from '../models/portfolio-api.model';
import { PortfolioLoadResult } from '../models/dto/portfolio-load-result.dto';
import { mergeWithWebsiteDefaults } from '../models/portfolio-defaults';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly mapper = new PortfolioMapper();

  getByTenant(tenantId: string): Observable<PortfolioLoadResult> {
    return this.http
      .get<ApiResponse<PortfolioApiDto>>(API_ENDPOINTS.portfolio.getByTenant(tenantId))
      .pipe(map((response) => this.mapPortfolioResponse(response)));
  }

  getBySlug(slug: string): Observable<PortfolioLoadResult> {
    return this.http
      .get<ApiResponse<PortfolioApiDto>>(API_ENDPOINTS.portfolio.getBySlug(slug))
      .pipe(map((response) => this.mapPortfolioResponse(response)));
  }

  getPublishedBySlug(slug: string): Observable<Portfolio> {
    return this.getBySlug(slug).pipe(
      map((result) => {
        const portfolio = result.portfolio;
        if (!portfolio?.published) {
          throw new Error('NOT_FOUND');
        }
        return mergeWithWebsiteDefaults(structuredClone(portfolio));
      })
    );
  }

  getBusinessProfileByTenant(tenantId: string): Observable<BusinessProfileDto | null> {
    return this.getByTenant(tenantId).pipe(map((result) => result.businessProfile));
  }

  private mapPortfolioResponse(response: ApiResponse<PortfolioApiDto>): PortfolioLoadResult {
    if (!response.success) {
      throw new Error(response.message || 'Failed to load portfolio');
    }
    const data = response.data ?? null;
    const portfolioDto = extractPortfolioDraftFromApi(data);
    return {
      user: extractUserFromPortfolio(data),
      businessProfile: extractBusinessProfileFromPortfolio(data),
      presetId: extractPresetIdFromPortfolio(data),
      portfolio: portfolioDto ? this.mapper.map(portfolioDto) : null
    };
  }
}
