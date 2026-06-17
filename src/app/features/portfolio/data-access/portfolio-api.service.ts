import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { BusinessProfileDto } from '../../admin/models/business-profile.model';
import { UserDto } from '../../admin/models/user.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioMapper } from './portfolio.mapper';
import {
  PortfolioApiDto,
  extractBusinessProfileFromPortfolio,
  extractPortfolioDraftFromApi,
  extractPresetIdFromPortfolio,
  extractUserFromPortfolio
} from '../models/portfolio-api.model';

export interface PortfolioLoadResult {
  user: UserDto | null;
  businessProfile: BusinessProfileDto | null;
  presetId: string | null;
  portfolio: Portfolio | null;
}

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly mapper = new PortfolioMapper();

  getByTenant(tenantId: string): Observable<PortfolioLoadResult> {
    return this.http
      .get<ApiResponse<PortfolioApiDto>>(API_ENDPOINTS.portfolio.getByTenant(tenantId))
      .pipe(
        map((response) => {
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
        })
      );
  }

  getBusinessProfileByTenant(tenantId: string): Observable<BusinessProfileDto | null> {
    return this.getByTenant(tenantId).pipe(map((result) => result.businessProfile));
  }
}
