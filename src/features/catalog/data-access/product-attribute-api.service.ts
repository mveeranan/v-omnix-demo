import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import {
  ProductAttributeDto,
  UpsertProductAttributesRequest
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

  upsert(body: UpsertProductAttributesRequest): Observable<ProductAttributeDto[]> {
    return this.http
      .put<ApiResponse<ProductAttributeDto[]>>(API_ENDPOINTS.productAttributes.upsert, body)
      .pipe(map(unwrapApiResponse));
  }
}
