import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import { PortfolioSocial } from '../models/portfolio.model';
import {
  PortfolioSocialMediaApiDto,
  SocialMediaDto,
  SocialMediaUpsertRequest,
  mapSocialMediaApiDto
} from '../models/social-media.model';
import { buildSocialMediaUpsertRequest } from './social-media-portfolio.util';

@Injectable({ providedIn: 'root' })
export class SocialMediaService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  resolveTenantId(): string | null {
    return this.authService.resolveTenantId();
  }

  upsertFromSocialBuffer(social: PortfolioSocial): Observable<SocialMediaDto> {
    const tenantId = this.resolveTenantId();
    if (!tenantId) {
      throw new Error('No tenant selected. Please log in again.');
    }
    return this.upsert(buildSocialMediaUpsertRequest(tenantId, social));
  }

  upsert(body: SocialMediaUpsertRequest): Observable<SocialMediaDto> {
    return this.http
      .put<ApiResponse<PortfolioSocialMediaApiDto>>(API_ENDPOINTS.socialMedia.upsert, body)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to save social media links');
          }
          const mapped = mapSocialMediaApiDto(response.data, body.tenantId);
          if (!mapped) {
            throw new Error('Failed to parse social media response');
          }
          return mapped;
        })
      );
  }
}
