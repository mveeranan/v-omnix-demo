import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { Return, CreateReturnRequest, UpdateReturnStatusRequest } from '../models/return.model';

interface ListReturnsResponse {
  items: Return[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReturnApiService {
  private readonly http = inject(HttpClient);

  list(page: number = 1, pageSize: number = 20): Observable<ListReturnsResponse> {
    const url = `${API_ENDPOINTS.returns.list}?page=${page}&pageSize=${pageSize}`;
    return this.http.get<ApiResponse<ListReturnsResponse>>(url)
      .pipe(map(response => response.data));
  }

  create(request: CreateReturnRequest): Observable<Return> {
    return this.http.post<ApiResponse<Return>>(API_ENDPOINTS.returns.create, request)
      .pipe(map(response => response.data));
  }

  get(id: string): Observable<Return> {
    return this.http.get<ApiResponse<Return>>(API_ENDPOINTS.returns.get(id))
      .pipe(map(response => response.data));
  }

  approve(id: string, adminNotes?: string): Observable<Return> {
    const payload = { adminNotes };
    return this.http.put<ApiResponse<Return>>(API_ENDPOINTS.returns.approve(id), payload)
      .pipe(map(response => response.data));
  }

  reject(id: string, adminNotes?: string): Observable<Return> {
    const payload = { adminNotes };
    return this.http.put<ApiResponse<Return>>(API_ENDPOINTS.returns.reject(id), payload)
      .pipe(map(response => response.data));
  }

  markAsShipped(id: string): Observable<Return> {
    return this.http.put<ApiResponse<Return>>(API_ENDPOINTS.returns.markAsShipped(id), {})
      .pipe(map(response => response.data));
  }

  markAsReceived(id: string): Observable<Return> {
    return this.http.put<ApiResponse<Return>>(API_ENDPOINTS.returns.markAsReceived(id), {})
      .pipe(map(response => response.data));
  }

  complete(id: string, adminNotes?: string): Observable<Return> {
    const payload = { adminNotes };
    return this.http.put<ApiResponse<Return>>(API_ENDPOINTS.returns.complete(id), payload)
      .pipe(map(response => response.data));
  }
}
