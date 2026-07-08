import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@env/api.constants';
import { ApiResponse } from '@shared/models/api-response.model';
import {
  WebsitePublishRequest,
  WebsiteSectionListItem,
  WebsiteSectionSaveRequest,
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

  publish(payload: WebsitePublishRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(API_ENDPOINTS.website.publish, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to publish website');
        }
      })
    );
  }

  /** Loads all saved home-page sections for the tenant, ordered by display order — used by the admin editor. */
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

  /** Applies a new display order to the tenant's home-page sections. */
  reorderSections(tenantId: string, sectionTypes: string[]): Observable<void> {
    return this.http
      .put<ApiResponse<unknown>>(API_ENDPOINTS.website.reorderSections, { tenantId, sectionTypes })
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to reorder website sections');
          }
        })
      );
  }

  /** Soft-deletes a single section (by type name) from the tenant's home page. */
  deleteSection(sectionType: string, tenantId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(API_ENDPOINTS.website.deleteSection(sectionType, tenantId))
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete website section');
          }
        })
      );
  }

  /** Saves the tenant's theme preset id plus optional per-token overrides. */
  saveTheme(payload: WebsiteThemeSaveRequest): Observable<void> {
    return this.http.put<ApiResponse<unknown>>(API_ENDPOINTS.website.theme, payload).pipe(
      map((response) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to save theme');
        }
      })
    );
  }

}
