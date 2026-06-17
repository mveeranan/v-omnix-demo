import { PortfolioColorScheme, PortfolioTheme } from '../../models/portfolio.model';

export const MOX_COLOR_SCHEME_ACCENTS: Record<PortfolioColorScheme, string> = {
  amber: '#ff6f00',
  teal: '#00897b',
  rose: '#e91e63',
  indigo: '#3949ab',
  green: '#43a047',
  slate: '#546e7a'
};

export function moxSchemeClass(scheme: PortfolioColorScheme | undefined): string {
  return `mox-scheme-${scheme ?? 'amber'}`;
}

const INK = '#0f172a';
const PAPER = '#f8fafc';
const WHITE = '#ffffff';
const DARK_BASE = '#0c0a09';

function normalizeHex(input: string, fallback: string): string {
  const raw = (input ?? '').trim();
  if (!raw) return fallback;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const h = raw.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex, '');
  if (!normalized) return null;
  const h = normalized.slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function mixHex(a: string, b: string, amountB: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return b;
  const t = Math.max(0, Math.min(1, amountB));
  return rgbToHex(ra.r + (rb.r - ra.r) * t, ra.g + (rb.g - ra.g) * t, ra.b + (rb.b - ra.b) * t);
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

/** Pick light or dark foreground for a given background. */
function contrastOn(bg: string): string {
  return luminance(bg) > 0.48 ? INK : PAPER;
}

/** If fg is too close to bg luminance, return a contrasting color. */
function readableOn(fg: string, bg: string, minDelta = 0.26): string {
  if (Math.abs(luminance(fg) - luminance(bg)) >= minDelta) return fg;
  return contrastOn(bg);
}

/** Accent used for filled buttons/badges — nudged away from page bg if needed. */
function buttonColors(accent: string, pageBg: string): { bg: string; fg: string } {
  let bg = accent;
  const pageLum = luminance(pageBg);
  const accentLum = luminance(accent);

  if (Math.abs(accentLum - pageLum) < 0.18) {
    bg = pageLum > 0.5 ? mixHex(accent, INK, 0.55) : mixHex(accent, PAPER, 0.65);
  }

  if (luminance(bg) > 0.72 && pageLum > 0.5) {
    bg = mixHex(bg, INK, 0.4);
  }
  if (luminance(bg) < 0.2 && pageLum < 0.5) {
    bg = mixHex(bg, PAPER, 0.45);
  }

  const fg = readableOn(contrastOn(bg), bg, 0.32);
  return { bg, fg };
}

export function buildPortfolioThemeVars(theme: PortfolioTheme): Record<string, string> {
  const mode = theme.mode ?? 'light';
  const borderRadius = theme.borderRadius ?? '0.75rem';
  const isLight = mode === 'light';
  const brand = normalizeHex(theme.primaryColor, isLight ? INK : DARK_BASE);
  const schemeAccent = theme.colorScheme ? MOX_COLOR_SCHEME_ACCENTS[theme.colorScheme] : undefined;
  const accent = normalizeHex(
    theme.presetId === 'mox-ecommerce' && schemeAccent ? schemeAccent : theme.accentColor,
    isLight ? '#2563eb' : '#c4b5fd'
  );

  const bg = isLight
    ? mixHex(WHITE, brand, 0.04)
    : luminance(brand) < 0.38
      ? brand
      : mixHex(DARK_BASE, brand, 0.22);

  const bgAlt = isLight ? mixHex(WHITE, brand, 0.09) : mixHex(bg, PAPER, 0.08);

  const text = readableOn(isLight ? brand : PAPER, bg);
  const textMuted = isLight
    ? mixHex(text, WHITE, 0.42)
    : mixHex(text, bg, 0.38);

  const heading = readableOn(brand, bg);
  const accentText = readableOn(accent, bg, 0.22);
  const { bg: btnBg, fg: btnFg } = buttonColors(accent, bg);

  const heroBackdrop = mixHex(bg, '#000000', isLight ? 0.55 : 0.35);
  const heroTitle = PAPER;
  const heroTagline = readableOn(accent, heroBackdrop, 0.2);
  const heroTaglineFinal =
    luminance(heroTagline) > 0.55 ? heroTagline : mixHex(PAPER, accent, 0.25);

  const glassBg = isLight
    ? 'rgba(255, 255, 255, 0.82)'
    : `color-mix(in srgb, ${bg} 78%, transparent)`;
  const glassBorder = `color-mix(in srgb, ${readableOn(accent, bg, 0.18)} 38%, transparent)`;

  return {
    '--pf-primary': brand,
    '--pf-accent': accent,
    '--pf-accent-text': accentText,
    '--pf-radius': borderRadius,
    '--pf-font': theme.fontFamily,
    '--pf-bg': bg,
    '--pf-surface': bg,
    '--pf-surface-alt': bgAlt,
    '--pf-text': text,
    '--pf-text-muted': textMuted,
    '--pf-heading': heading,
    '--pf-btn-bg': btnBg,
    '--pf-btn-fg': btnFg,
    '--pf-on-accent': btnFg,
    '--pf-hero-title': heroTitle,
    '--pf-hero-tagline': heroTaglineFinal,
    '--pf-hero-subtitle': mixHex(PAPER, bg, 0.12),
    '--pf-glass-bg': glassBg,
    '--pf-glass-border': glassBorder,
    '--pf-nav-bg': `color-mix(in srgb, ${bg} 88%, transparent)`,
    '--pf-nav-border': glassBorder,
    '--mox-primary': brand,
    '--mox-accent': accent,
    '--mox-sale': accent,
    '--mox-text': text,
    '--mox-muted': textMuted,
    '--mox-border': isLight ? '#e0e0e0' : mixHex(bg, PAPER, 0.15),
    '--mox-radius': borderRadius,
    '--mox-font-body': theme.fontFamily,
    '--mox-font-heading': "'Poppins', Roboto, sans-serif"
  };
}
