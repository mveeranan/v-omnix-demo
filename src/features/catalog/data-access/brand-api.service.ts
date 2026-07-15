import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import { BrandDto, SaveBrandRequest } from '../models/brand.model';
import { requireTenantId, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class BrandApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<BrandDto[]> {
    return this.http
      .get<ApiResponse<BrandDto[]>>(API_ENDPOINTS.brands.list())
      .pipe(map(unwrapApiResponse));
  }

  create(body: SaveBrandRequest): Observable<BrandDto> {
    return this.http
      .post<ApiResponse<BrandDto>>(API_ENDPOINTS.brands.create, body)
      .pipe(map(unwrapApiResponse));
  }

  update(id: string, body: SaveBrandRequest): Observable<BrandDto> {
    return this.http
      .put<ApiResponse<BrandDto>>(API_ENDPOINTS.brands.update(id), body)
      .pipe(map(unwrapApiResponse));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(API_ENDPOINTS.brands.delete(id))
      .pipe(map(unwrapApiResponse))
      .pipe(map(() => undefined));
  }
}
