import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  BusinessProfileDto,
  BusinessProfileUpsertRequest
} from '../models/business-profile.model';

@Injectable({ providedIn: 'root' })
export class BusinessProfileService {
  private readonly http = inject(HttpClient);

  getByTenant(tenantId: string): Observable<BusinessProfileDto | null> {
    return this.http
      .get<ApiResponse<BusinessProfileDto | null>>(API_ENDPOINTS.businessProfile.getByTenant(tenantId))
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Request failed');
          }
          return response.data ?? null;
        })
      );
  }

  upsert(payload: BusinessProfileUpsertRequest): Observable<BusinessProfileDto> {
    return this.http
      .put<ApiResponse<BusinessProfileDto>>(API_ENDPOINTS.businessProfile.upsert, payload)
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }
}
