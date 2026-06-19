import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { BusinessProfileDto } from '@features/admin/models/business-profile.model';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioMapper } from './portfolio.mapper';
import {
  PortfolioApiDto,
  extractBusinessProfileFromPortfolio,
  extractHeroSlidesFromPortfolio,
  extractSocialMediaFromPortfolio,
  extractPortfolioDraftFromApi,
  extractPresetIdFromPortfolio,
  extractUserFromPortfolio
} from '../models/portfolio-api.model';
import { PortfolioLoadResult } from '../models/dto/portfolio-load-result.dto';
import { mergeWithWebsiteDefaults } from '../models/portfolio-defaults';
import { mergeBusinessProfileIntoPortfolio } from './business-profile-portfolio.util';
import { mergeHeroSlidesIntoPortfolio } from './hero-slides-portfolio.util';
import { mergeSocialMediaIntoPortfolio } from './social-media-portfolio.util';
import { ThemePresetsService } from './theme-presets.service';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly mapper = new PortfolioMapper();
  private readonly themePresets = inject(ThemePresetsService);

  getByTenant(tenantId: string): Observable<PortfolioLoadResult> {
    return this.http
      .get<ApiResponse<PortfolioApiDto>>(API_ENDPOINTS.portfolio.getByTenant(tenantId))
      .pipe(map((response) => this.mapPortfolioResponse(response, tenantId)));
  }

  getBySlug(slug: string): Observable<PortfolioLoadResult> {
    return this.http
      .get<ApiResponse<PortfolioApiDto>>(API_ENDPOINTS.portfolio.getBySlug(slug))
      .pipe(map((response) => this.mapPortfolioResponse(response)));
  }

  getPublishedBySlug(slug: string): Observable<Portfolio> {
    return this.themePresets.list().pipe(
      switchMap(() =>
        this.getBySlug(slug).pipe(
          map((result) => {
            const portfolio = result.portfolio;
            if (!portfolio?.published) {
              throw new Error('NOT_FOUND');
            }
            const catalog = this.themePresets.getCatalog();
            let merged = mergeWithWebsiteDefaults(structuredClone(portfolio));
            if (result.businessProfile) {
              merged = mergeBusinessProfileIntoPortfolio(merged, result.businessProfile, catalog);
            }
            const heroSlides = result.heroSlides ?? [];
            if (heroSlides.length) {
              merged = mergeHeroSlidesIntoPortfolio(merged, heroSlides);
            }
            if (result.socialMedia) {
              merged = mergeSocialMediaIntoPortfolio(merged, result.socialMedia);
            }
            const presetId = result.presetId?.trim() || result.businessProfile?.presetId?.trim();
            if (presetId) {
              merged = { ...merged, theme: this.themePresets.resolvePortfolioTheme(presetId) };
            }
            return merged;
          })
        )
      )
    );
  }

  getBusinessProfileByTenant(tenantId: string): Observable<BusinessProfileDto | null> {
    return this.getByTenant(tenantId).pipe(map((result) => result.businessProfile));
  }

  private mapPortfolioResponse(response: ApiResponse<PortfolioApiDto>, tenantIdFallback = ''): PortfolioLoadResult {
    if (!response.success) {
      throw new Error(response.message || 'Failed to load portfolio');
    }
    const data = response.data ?? null;
    const portfolioDto = extractPortfolioDraftFromApi(data);
    const heroSlides = extractHeroSlidesFromPortfolio(data);
    const socialMedia = extractSocialMediaFromPortfolio(data, tenantIdFallback);
    let portfolio = null;
    if (portfolioDto) {
      try {
        portfolio = this.mapper.map(portfolioDto);
      } catch {
        portfolio = null;
      }
    }
    if (portfolio) {
      portfolio = mergeWithWebsiteDefaults(portfolio);
      if (heroSlides.length) {
        portfolio = mergeHeroSlidesIntoPortfolio(portfolio, heroSlides);
      }
      if (socialMedia) {
        portfolio = mergeSocialMediaIntoPortfolio(portfolio, socialMedia);
      }
    }
    return {
      user: extractUserFromPortfolio(data),
      businessProfile: extractBusinessProfileFromPortfolio(data),
      presetId: extractPresetIdFromPortfolio(data),
      heroSlides,
      socialMedia,
      portfolio
    };
  }
}
