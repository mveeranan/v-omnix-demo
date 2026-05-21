import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { BranchDto, BranchUpsertRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly http = inject(HttpClient);

  listByTenant(tenantId: string): Observable<BranchDto[]> {
    return this.http
      .get<ApiResponse<BranchDto[] | null>>(API_ENDPOINTS.branches.listByTenant(tenantId))
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Request failed');
          }
          return response.data ?? [];
        })
      );
  }

  upsert(payload: BranchUpsertRequest): Observable<BranchDto> {
    return this.http
      .put<ApiResponse<BranchDto>>(API_ENDPOINTS.branches.upsert, payload)
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data;
  }
}
