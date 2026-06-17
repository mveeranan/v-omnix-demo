import { PortfolioColorScheme, PortfolioTheme } from './portfolio.model';

/** API catalog item from GET /theme-presets */
export interface ThemePresetApiDto {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  primaryColor?: string;
  PrimaryColor?: string;
  accentColor?: string;
  AccentColor?: string;
  fontFamily?: string;
  FontFamily?: string;
  colorScheme?: PortfolioColorScheme;
  ColorScheme?: PortfolioColorScheme;
}

export interface ThemePresetDto {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  colorScheme: PortfolioColorScheme;
}

export interface ThemeOverrides {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  colorScheme?: PortfolioColorScheme;
}

export function mapThemePreset(dto: ThemePresetApiDto): ThemePresetDto {
  return {
    id: (dto.id ?? dto.Id ?? '').trim(),
    name: (dto.name ?? dto.Name ?? '').trim(),
    primaryColor: (dto.primaryColor ?? dto.PrimaryColor ?? '#0f172a').trim(),
    accentColor: (dto.accentColor ?? dto.AccentColor ?? '#2563eb').trim(),
    fontFamily: (dto.fontFamily ?? dto.FontFamily ?? 'system-ui, sans-serif').trim(),
    colorScheme: (dto.colorScheme ?? dto.ColorScheme ?? 'indigo') as PortfolioColorScheme
  };
}

export function themePresetToPortfolioTheme(preset: ThemePresetDto): PortfolioTheme {
  return {
    presetId: preset.id,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    fontFamily: preset.fontFamily,
    colorScheme: preset.colorScheme,
    mode: 'light'
  };
}

export function mergeThemeWithPreset(
  preset: ThemePresetDto,
  overrides?: ThemeOverrides | null
): PortfolioTheme {
  return {
    presetId: preset.id,
    primaryColor: overrides?.primaryColor?.trim() || preset.primaryColor,
    accentColor: overrides?.accentColor?.trim() || preset.accentColor,
    fontFamily: overrides?.fontFamily?.trim() || preset.fontFamily,
    colorScheme: overrides?.colorScheme ?? preset.colorScheme,
    mode: 'light'
  };
}

export const DEFAULT_THEME_BORDER_RADIUS = '0.75rem';
export const DEFAULT_THEME_MODE = 'light' as const;

export function normalizePortfolioTheme(theme: Partial<PortfolioTheme> | undefined): PortfolioTheme {
  return {
    presetId: theme?.presetId ?? 'mox-ecommerce',
    primaryColor: theme?.primaryColor ?? '#263238',
    accentColor: theme?.accentColor ?? '#ff6f00',
    fontFamily: theme?.fontFamily ?? 'Roboto, sans-serif',
    colorScheme: theme?.colorScheme ?? 'amber',
    mode: theme?.mode ?? DEFAULT_THEME_MODE,
    borderRadius: theme?.borderRadius ?? DEFAULT_THEME_BORDER_RADIUS
  };
}

export function extractThemeOverrides(
  theme: PortfolioTheme,
  preset: ThemePresetDto
): ThemeOverrides | null {
  const overrides: ThemeOverrides = {};
  if (theme.primaryColor !== preset.primaryColor) {
    overrides.primaryColor = theme.primaryColor;
  }
  if (theme.accentColor !== preset.accentColor) {
    overrides.accentColor = theme.accentColor;
  }
  if (theme.fontFamily !== preset.fontFamily) {
    overrides.fontFamily = theme.fontFamily;
  }
  if (theme.colorScheme !== preset.colorScheme) {
    overrides.colorScheme = theme.colorScheme;
  }
  return Object.keys(overrides).length > 0 ? overrides : null;
}
