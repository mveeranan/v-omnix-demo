import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse, getFirstApiError } from '../../../shared/models/api-response.model';
import {
  BranchDto,
  BranchUpsertRequest,
  normalizeBranchDto,
  normalizeBranchList
} from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly http = inject(HttpClient);

  listByTenant(tenantId: string): Observable<BranchDto[]> {
    return this.http
      .get<ApiResponse<unknown>>(API_ENDPOINTS.branches.listByTenant(tenantId))
      .pipe(map((response) => this.unwrapList(response)));
  }

  upsert(payload: BranchUpsertRequest): Observable<BranchDto> {
    return this.http
      .put<ApiResponse<unknown>>(API_ENDPOINTS.branches.upsert, payload)
      .pipe(map((response) => this.unwrapOne(response)));
  }

  private unwrapList(response: ApiResponse<unknown>): BranchDto[] {
    if (!response.success) {
      throw new Error(response.message || getFirstApiError(response.errors) || 'Request failed');
    }
    return normalizeBranchList(response.data);
  }

  private unwrapOne(response: ApiResponse<unknown>): BranchDto {
    if (!response.success) {
      throw new Error(response.message || getFirstApiError(response.errors) || 'Request failed');
    }
    const item = normalizeBranchDto(response.data);
    if (!item) {
      throw new Error('Invalid branch response from server.');
    }
    return item;
  }
}
