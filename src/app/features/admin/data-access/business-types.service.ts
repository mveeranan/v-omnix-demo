import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  BusinessGroupApiDto,
  BusinessGroupDto,
  mapBusinessGroup
} from '../models/business-type.model';

@Injectable({ providedIn: 'root' })
export class BusinessTypesService {
  private readonly http = inject(HttpClient);
  private cache: BusinessGroupDto[] | null = null;

  listGroups(): Observable<BusinessGroupDto[]> {
    if (this.cache) {
      return of(this.cache);
    }
    return this.http
      .get<ApiResponse<BusinessGroupApiDto[]>>(API_ENDPOINTS.businessTypes.list)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to load business types');
          }
          this.cache = (response.data ?? []).map(mapBusinessGroup);
          return this.cache;
        })
      );
  }
}
