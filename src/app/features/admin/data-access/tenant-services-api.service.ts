import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse, getFirstApiError } from '../../../shared/models/api-response.model';
import {
  CreateServiceRequest,
  ServiceDto,
  UpdateServiceRequest,
  normalizeServiceDto,
  normalizeServiceList
} from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class TenantServicesApiService {
  private readonly http = inject(HttpClient);

  listByTenant(tenantId: string): Observable<ServiceDto[]> {
    return this.http
      .get<ApiResponse<unknown>>(API_ENDPOINTS.services.listByTenant(tenantId))
      .pipe(map((response) => this.unwrapList(response)));
  }

  create(payload: CreateServiceRequest): Observable<ServiceDto> {
    return this.http
      .post<ApiResponse<unknown>>(API_ENDPOINTS.services.create, payload)
      .pipe(map((response) => this.unwrapOne(response)));
  }

  update(payload: UpdateServiceRequest): Observable<ServiceDto> {
    return this.http
      .put<ApiResponse<unknown>>(API_ENDPOINTS.services.update, payload)
      .pipe(map((response) => this.unwrapOne(response)));
  }

  private unwrapList(response: ApiResponse<unknown>): ServiceDto[] {
    if (!response.success) {
      throw new Error(response.message || getFirstApiError(response.errors) || 'Request failed');
    }
    return normalizeServiceList(response.data);
  }

  private unwrapOne(response: ApiResponse<unknown>): ServiceDto {
    if (!response.success) {
      throw new Error(response.message || getFirstApiError(response.errors) || 'Request failed');
    }
    const item = normalizeServiceDto(response.data);
    if (!item) {
      throw new Error('Invalid service response from server.');
    }
    return item;
  }
}
