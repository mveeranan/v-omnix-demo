import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  WebsitePublishRequest,
  WebsiteSectionSaveRequest
} from '../models/website-api.model';

@Injectable({ providedIn: 'root' })
export class WebsiteApiService {
  private readonly http = inject(HttpClient);

  saveSection(payload: WebsiteSectionSaveRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(API_ENDPOINTS.website.saveSection, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to save website section');
        }
      })
    );
  }

  publish(payload: WebsitePublishRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(API_ENDPOINTS.website.publish, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to publish website');
        }
      })
    );
  }
}
