import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import {
  ProductAttributeDto,
  SaveProductAttributeRequest
} from '../models/product-attribute.model';
import { requireTenantId, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class ProductAttributeApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(tenantId?: string): Observable<ProductAttributeDto[]> {
    const id = tenantId ?? requireTenantId(this.auth);
    return this.http
      .get<ApiResponse<ProductAttributeDto[]>>(API_ENDPOINTS.productAttributes.list(id))
      .pipe(map(unwrapApiResponse));
  }

  create(body: SaveProductAttributeRequest): Observable<ProductAttributeDto> {
    return this.http
      .post<ApiResponse<ProductAttributeDto>>(API_ENDPOINTS.productAttributes.create, body)
      .pipe(map(unwrapApiResponse));
  }

  update(id: string, body: SaveProductAttributeRequest): Observable<ProductAttributeDto> {
    return this.http
      .put<ApiResponse<ProductAttributeDto>>(API_ENDPOINTS.productAttributes.update(id), body)
      .pipe(map(unwrapApiResponse));
  }
}
