import { PortfolioColorScheme, PortfolioTheme } from './portfolio.model';
import { getThemePresetById } from './portfolio-theme.presets';

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
  secondaryColor?: string | null;
  SecondaryColor?: string | null;
  backgroundColor?: string | null;
  BackgroundColor?: string | null;
  surfaceColor?: string | null;
  SurfaceColor?: string | null;
  textColor?: string | null;
  TextColor?: string | null;
  mutedTextColor?: string | null;
  MutedTextColor?: string | null;
  borderColor?: string | null;
  BorderColor?: string | null;
  fontFamily?: string;
  FontFamily?: string;
  headingFontFamily?: string | null;
  HeadingFontFamily?: string | null;
  colorScheme?: PortfolioColorScheme;
  ColorScheme?: PortfolioColorScheme;
  borderRadiusPx?: number;
  BorderRadiusPx?: number;
  buttonStyle?: string;
  ButtonStyle?: string;
}

export interface ThemePresetDto {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  fontFamily: string;
  headingFontFamily?: string;
  colorScheme: PortfolioColorScheme;
  borderRadiusPx?: number;
  buttonStyle?: string;
}

/**
 * Per-tenant theme token overrides — stored verbatim on the backend
 * (BusinessProfile.ThemeOverridesJson) and merged over the preset at render time.
 */
export interface ThemeOverrides {
  primaryColor?: string;
  accentColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
  fontFamily?: string;
  headingFontFamily?: string;
  colorScheme?: PortfolioColorScheme;
  /** CSS length, e.g. "4px" or "0.75rem". */
  borderRadius?: string;
  /** "rounded" | "square" | "pill" */
  buttonStyle?: string;
}

function cleanStr(value: string | null | undefined): string | undefined {
  const v = (value ?? '').trim();
  return v.length > 0 ? v : undefined;
}

export function mapThemePreset(dto: ThemePresetApiDto): ThemePresetDto {
  return {
    id: (dto.id ?? dto.Id ?? '').trim(),
    name: (dto.name ?? dto.Name ?? '').trim(),
    primaryColor: (dto.primaryColor ?? dto.PrimaryColor ?? '#0f172a').trim(),
    accentColor: (dto.accentColor ?? dto.AccentColor ?? '#2563eb').trim(),
    secondaryColor: cleanStr(dto.secondaryColor ?? dto.SecondaryColor),
    backgroundColor: cleanStr(dto.backgroundColor ?? dto.BackgroundColor),
    surfaceColor: cleanStr(dto.surfaceColor ?? dto.SurfaceColor),
    textColor: cleanStr(dto.textColor ?? dto.TextColor),
    mutedTextColor: cleanStr(dto.mutedTextColor ?? dto.MutedTextColor),
    borderColor: cleanStr(dto.borderColor ?? dto.BorderColor),
    fontFamily: (dto.fontFamily ?? dto.FontFamily ?? 'system-ui, sans-serif').trim(),
    headingFontFamily: cleanStr(dto.headingFontFamily ?? dto.HeadingFontFamily),
    colorScheme: (dto.colorScheme ?? dto.ColorScheme ?? 'indigo') as PortfolioColorScheme,
    borderRadiusPx: dto.borderRadiusPx ?? dto.BorderRadiusPx,
    buttonStyle: cleanStr(dto.buttonStyle ?? dto.ButtonStyle)
  };
}

export function themePresetToPortfolioTheme(preset: ThemePresetDto): PortfolioTheme {
  return {
    presetId: preset.id,
    primaryColor: preset.primaryColor,
    accentColor: preset.accentColor,
    secondaryColor: preset.secondaryColor,
    backgroundColor: preset.backgroundColor,
    surfaceColor: preset.surfaceColor,
    textColor: preset.textColor,
    mutedTextColor: preset.mutedTextColor,
    borderColor: preset.borderColor,
    fontFamily: preset.fontFamily,
    headingFontFamily: preset.headingFontFamily,
    colorScheme: preset.colorScheme,
    borderRadius: preset.borderRadiusPx != null ? `${preset.borderRadiusPx}px` : undefined,
    buttonStyle: preset.buttonStyle,
    mode: 'light'
  };
}

export function mergeThemeWithPreset(
  preset: ThemePresetDto,
  overrides?: ThemeOverrides | null
): PortfolioTheme {
  const base = themePresetToPortfolioTheme(preset);
  return {
    ...base,
    ...pickDefined(overrides ?? {}),
    presetId: preset.id,
    mode: 'light',
    overrides: (overrides ?? undefined) as PortfolioTheme['overrides']
  };
}

export const DEFAULT_THEME_BORDER_RADIUS = '0.75rem';
export const DEFAULT_THEME_MODE = 'light' as const;

/** Drop undefined / null / empty-string entries so they don't clobber base values. */
function pickDefined<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim().length === 0) continue;
    (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

export function normalizePortfolioTheme(theme: Partial<PortfolioTheme> | undefined): PortfolioTheme {
  const presetId = theme?.presetId ?? 'mox-ecommerce';

  // Local preset catalog gives full token defaults for known presets.
  const localPreset = getThemePresetById(presetId)?.theme;

  const base: PortfolioTheme = {
    presetId,
    primaryColor: localPreset?.primaryColor ?? '#263238',
    accentColor: localPreset?.accentColor ?? '#ff6f00',
    fontFamily: localPreset?.fontFamily ?? 'Roboto, sans-serif',
    colorScheme: localPreset?.colorScheme ?? 'amber',
    mode: DEFAULT_THEME_MODE,
    borderRadius: localPreset?.borderRadius ?? DEFAULT_THEME_BORDER_RADIUS,
    secondaryColor: localPreset?.secondaryColor,
    backgroundColor: localPreset?.backgroundColor,
    surfaceColor: localPreset?.surfaceColor,
    textColor: localPreset?.textColor,
    mutedTextColor: localPreset?.mutedTextColor,
    borderColor: localPreset?.borderColor,
    headingFontFamily: localPreset?.headingFontFamily,
    buttonStyle: localPreset?.buttonStyle
  };

  const overrides = (theme?.overrides ?? undefined) as ThemeOverrides | undefined;

  return {
    ...base,
    ...pickDefined(theme ?? {}),
    ...pickDefined(overrides ?? {}),
    presetId,
    overrides: theme?.overrides ?? undefined
  };
}

export function extractThemeOverrides(
  theme: PortfolioTheme,
  preset: ThemePresetDto
): ThemeOverrides | null {
  const presetTheme = themePresetToPortfolioTheme(preset);
  const overrides: ThemeOverrides = {};

  const compare: (keyof ThemeOverrides & keyof PortfolioTheme)[] = [
    'primaryColor',
    'accentColor',
    'secondaryColor',
    'backgroundColor',
    'surfaceColor',
    'textColor',
    'mutedTextColor',
    'borderColor',
    'fontFamily',
    'headingFontFamily',
    'colorScheme',
    'borderRadius',
    'buttonStyle'
  ];

  for (const key of compare) {
    const themeValue = theme[key];
    const presetValue = presetTheme[key];
    if (themeValue != null && themeValue !== '' && themeValue !== presetValue) {
      (overrides as Record<string, unknown>)[key] = themeValue;
    }
  }

  return Object.keys(overrides).length > 0 ? overrides : null;
}
