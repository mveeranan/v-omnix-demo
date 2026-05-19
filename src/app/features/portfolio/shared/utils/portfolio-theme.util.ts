import { PortfolioTheme } from '../../models/portfolio.model';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0] + normalized[0], 16),
      g: parseInt(normalized[1] + normalized[1], 16),
      b: parseInt(normalized[2] + normalized[2], 16)
    };
  }
  if (normalized.length !== 6) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function buildPortfolioThemeVars(theme: PortfolioTheme): Record<string, string> {
  const onAccent = luminance(theme.accentColor) > 0.45 ? theme.primaryColor : '#ffffff';

  const text = theme.mode === 'light' ? theme.primaryColor : '#f8fafc';

  const textMuted =
    theme.mode === 'light'
      ? `color-mix(in srgb, ${theme.primaryColor} 62%, transparent)`
      : `color-mix(in srgb, ${text} 72%, transparent)`;

  return {
    '--pf-primary': theme.primaryColor,
    '--pf-accent': theme.accentColor,
    '--pf-radius': theme.borderRadius,
    '--pf-font': theme.fontFamily,
    '--pf-text': text,
    '--pf-text-muted': textMuted,
    '--pf-heading': text,
    '--pf-on-accent': onAccent,
    '--pf-hero-title': '#ffffff',
    '--pf-hero-tagline': theme.accentColor,
    '--pf-hero-subtitle': 'color-mix(in srgb, #ffffff 88%, transparent)',
    '--pf-surface': theme.mode === 'light' ? '#ffffff' : theme.primaryColor,
    '--pf-surface-alt':
      theme.mode === 'light'
        ? `color-mix(in srgb, ${theme.primaryColor} 5%, white)`
        : `color-mix(in srgb, ${theme.primaryColor} 88%, white 12%)`
  };
}
