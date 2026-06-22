import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import { PortfolioHero } from '../models/portfolio.model';
import {
  HeroSlideApiDto,
  HeroSlideDto,
  HeroSlidesUpsertRequest,
  mapHeroSlidesApiList
} from '../models/hero-slides.model';
import {
  buildHeroSlidesUpsertRequest,
  HeroSlidePendingUploads
} from './hero-slides-portfolio.util';

@Injectable({ providedIn: 'root' })
export class HeroSlidesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  resolveTenantId(): string | null {
    return this.authService.resolveTenantId();
  }

  upsertFromHeroBuffer(
    hero: PortfolioHero,
    pending: HeroSlidePendingUploads
  ): Observable<HeroSlideDto[]> {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      throw new Error('No tenant selected. Please log in again.');
    }

    return from(buildHeroSlidesUpsertRequest(tenantId, hero, pending)).pipe(
      switchMap((body) => this.upsert(body))
    );
  }

  upsert(body: HeroSlidesUpsertRequest): Observable<HeroSlideDto[]> {
    return this.http
      .put<ApiResponse<HeroSlideApiDto[]>>(API_ENDPOINTS.heroSlides.upsert, body)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to save hero slides');
          }
          return mapHeroSlidesApiList(response.data);
        })
      );
  }
}
