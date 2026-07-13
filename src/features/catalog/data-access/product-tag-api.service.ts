import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import { AuthService } from '@core/auth/auth.service';
import { CreateProductTagRequest, ProductTagDto, SaveProductTagRequest } from '../models/product-tag.model';
import { requireTenantId, unwrapApiResponse } from './catalog-api.util';

@Injectable({ providedIn: 'root' })
export class ProductTagApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<ProductTagDto[]> {
    return this.http
      .get<ApiResponse<ProductTagDto[]>>(API_ENDPOINTS.productTags.list())
      .pipe(map(unwrapApiResponse));
  }

  create(body: CreateProductTagRequest): Observable<ProductTagDto> {
    return this.http
      .post<ApiResponse<ProductTagDto>>(API_ENDPOINTS.productTags.create, body)
      .pipe(map(unwrapApiResponse));
  }

  update(id: string, body: SaveProductTagRequest): Observable<ProductTagDto> {
    return this.http
      .put<ApiResponse<ProductTagDto>>(API_ENDPOINTS.productTags.update(id), body)
      .pipe(map(unwrapApiResponse));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(API_ENDPOINTS.productTags.delete(id))
      .pipe(map(() => undefined));
  }
}
