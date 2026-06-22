import { PortfolioTheme } from '../../models/portfolio.model';
import { PORTFOLIO_THEME_PRESETS } from '../../models/portfolio-theme.presets';
import {
  ThemePresetDto,
  normalizePortfolioTheme,
  themePresetToPortfolioTheme
} from '../../models/theme-preset.model';

export function resolvePortfolioThemeFromPresetId(
  presetId: string,
  catalog?: ThemePresetDto[]
): PortfolioTheme {
  const id = presetId.trim();
  if (!id) {
    return normalizePortfolioTheme(undefined);
  }

  const fromCatalog = catalog?.find((preset) => preset.id === id);
  if (fromCatalog) {
    return themePresetToPortfolioTheme(fromCatalog);
  }

  const local = PORTFOLIO_THEME_PRESETS.find((preset) => preset.id === id);
  if (local) {
    return { ...local.theme, presetId: id };
  }

  return normalizePortfolioTheme({ presetId: id });
}
