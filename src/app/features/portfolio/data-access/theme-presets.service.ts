import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { API_ENDPOINTS } from '../../../../environments/api.constants';
import { ApiResponse } from '../../../shared/models/api-response.model';
import {
  ThemePresetApiDto,
  ThemePresetDto,
  mapThemePreset,
  themePresetToPortfolioTheme
} from '../models/theme-preset.model';
import { PortfolioTheme } from '../models/portfolio.model';
import { PORTFOLIO_THEME_PRESETS } from '../models/portfolio-theme.presets';

@Injectable({ providedIn: 'root' })
export class ThemePresetsService {
  private readonly http = inject(HttpClient);
  private cache: ThemePresetDto[] | null = null;

  list(): Observable<ThemePresetDto[]> {
    if (this.cache) {
      return of(this.cache);
    }
    return this.http
      .get<ApiResponse<ThemePresetApiDto[]>>(API_ENDPOINTS.themePresets.list)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to load theme presets');
          }
          const presets = (response.data ?? [])
            .map(mapThemePreset)
            .filter((p) => p.id.length > 0);
          if (!presets.length) {
            return this.localFallback();
          }
          this.cache = presets;
          return presets;
        }),
        catchError(() => of(this.localFallback()))
      );
  }

  findById(id: string): ThemePresetDto | undefined {
    return this.cache?.find((p) => p.id === id);
  }

  toPortfolioTheme(preset: ThemePresetDto): PortfolioTheme {
    return themePresetToPortfolioTheme(preset);
  }

  private localFallback(): ThemePresetDto[] {
    const presets = PORTFOLIO_THEME_PRESETS.map((p) => ({
      id: p.id,
      name: p.label,
      primaryColor: p.theme.primaryColor,
      accentColor: p.theme.accentColor,
      fontFamily: p.theme.fontFamily,
      colorScheme: p.theme.colorScheme
    }));
    this.cache = presets;
    return presets;
  }
}
