import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse, getFirstApiError } from '../../../shared/models/api-response.model';
import { ServiceAssignmentRequest } from '../models/service-assignment.model';

@Injectable({ providedIn: 'root' })
export class ServiceAssignmentApiService {
  private readonly http = inject(HttpClient);

  assign(payload: ServiceAssignmentRequest): Observable<void> {
    return this.http
      .put<ApiResponse<unknown>>(API_ENDPOINTS.serviceAssignments.assign, payload)
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap(response: ApiResponse<unknown>): void {
    if (!response.success) {
      throw new Error(response.message || getFirstApiError(response.errors) || 'Request failed');
    }
  }
}
