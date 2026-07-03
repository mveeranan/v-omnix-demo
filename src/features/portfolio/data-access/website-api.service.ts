import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  WebsitePublishRequest,
  WebsiteSectionSaveRequest,
  WebsiteSectionListItem,
  WebsiteThemeSaveRequest
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

  listSections(tenantId: string): Observable<WebsiteSectionListItem[]> {
    return this.http
      .get<ApiResponse<WebsiteSectionListItem[]>>(API_ENDPOINTS.website.listSections(tenantId))
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to load website sections');
          }
          return response.data ?? [];
        })
      );
  }

  reorderSections(tenantId: string, sectionTypes: string[]): Observable<void> {
    return this.http
      .put<ApiResponse<unknown>>(API_ENDPOINTS.website.reorderSections, { tenantId, sectionTypes })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to reorder sections');
          }
        })
      );
  }

  deleteSection(tenantId: string, sectionType: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.website.deleteSection(sectionType, tenantId))
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete section');
          }
        })
      );
  }

  saveTheme(payload: WebsiteThemeSaveRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(API_ENDPOINTS.website.theme, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to save theme');
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
