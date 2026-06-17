import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  BusinessTypeApiDto,
  BusinessTypeDto,
  mapBusinessType
} from '../models/business-type.model';

@Injectable({ providedIn: 'root' })
export class BusinessTypesService {
  private readonly http = inject(HttpClient);
  private cache: BusinessTypeDto[] | null = null;

  list(): Observable<BusinessTypeDto[]> {
    if (this.cache) {
      return of(this.cache);
    }
    return this.http
      .get<ApiResponse<BusinessTypeApiDto[]>>(API_ENDPOINTS.businessTypes.list)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to load business types');
          }
          this.cache = (response.data ?? [])
            .map(mapBusinessType)
            .filter((t) => t.id.length > 0);
          return this.cache;
        })
      );
  }
}
