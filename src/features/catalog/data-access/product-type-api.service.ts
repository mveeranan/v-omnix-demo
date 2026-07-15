import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import { ProductTypeDto, SaveProductTypeRequest } from '../models/product-type.model';
import { requireTenantId, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class ProductTypeApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<ProductTypeDto[]> {
    return this.http
      .get<ApiResponse<ProductTypeDto[]>>(API_ENDPOINTS.productTypes.list())
      .pipe(map(unwrapApiResponse));
  }

  create(body: SaveProductTypeRequest): Observable<ProductTypeDto> {
    return this.http
      .post<ApiResponse<ProductTypeDto>>(API_ENDPOINTS.productTypes.create, body)
      .pipe(map(unwrapApiResponse));
  }

  update(id: string, body: SaveProductTypeRequest): Observable<ProductTypeDto> {
    return this.http
      .put<ApiResponse<ProductTypeDto>>(API_ENDPOINTS.productTypes.update(id), body)
      .pipe(map(unwrapApiResponse));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(API_ENDPOINTS.productTypes.delete(id))
      .pipe(map(() => undefined));
  }
}
