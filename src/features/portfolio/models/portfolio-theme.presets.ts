import { PortfolioTheme } from './portfolio.model';

export interface PortfolioThemePreset {
  id: string;
  label: string;
  description: string;
  theme: PortfolioTheme;
}

export const PORTFOLIO_THEME_PRESETS: PortfolioThemePreset[] = [
  {
    id: 'minishop',
    label: 'Minishop Minimal',
    description: 'Minimal product-first storefront — muted gold accent, black ink, pill buttons',
    theme: {
      presetId: 'minishop',
      primaryColor: '#000000',
      accentColor: '#dbcc8f',
      secondaryColor: '#dbcc8f',
      backgroundColor: '#ffffff',
      surfaceColor: '#ffffff',
      textColor: '#000000',
      mutedTextColor: '#808080',
      borderColor: '#eaeaea',
      fontFamily: '"Open Sans", system-ui, sans-serif',
      headingFontFamily: '"Open Sans", system-ui, sans-serif',
      borderRadius: '0px',
      buttonStyle: 'pill',
      mode: 'light',
      colorScheme: 'amber'
    }
  },
  {
    id: 'mox-ecommerce',
    label: 'Mox E-Commerce',
    description: 'Material-inspired storefront with warm amber accent',
    theme: {
      presetId: 'mox-ecommerce',
      primaryColor: '#263238',
      accentColor: '#ff6f00',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '8px',
      mode: 'light',
      colorScheme: 'amber'
    }
  },
  {
    id: 'luxury-black-gold',
    label: 'Luxury Black & Gold',
    description: 'High-end dark elegance with gold accents',
    theme: {
      presetId: 'luxury-black-gold',
      primaryColor: '#0a0a0a',
      accentColor: '#d4af37',
      fontFamily: 'Georgia, "Times New Roman", serif',
      borderRadius: '0.5rem',
      mode: 'dark',
      colorScheme: 'amber'
    }
  },
  {
    id: 'minimal-white',
    label: 'Minimal White',
    description: 'Clean, airy, professional',
    theme: {
      presetId: 'minimal-white',
      primaryColor: '#0f172a',
      accentColor: '#2563eb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      borderRadius: '0.75rem',
      mode: 'light',
      colorScheme: 'indigo'
    }
  },
  {
    id: 'tattoo-studio',
    label: 'Tattoo Studio',
    description: 'Bold contrast, urban edge',
    theme: {
      presetId: 'tattoo-studio',
      primaryColor: '#111827',
      accentColor: '#ef4444',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
      borderRadius: '0.25rem',
      mode: 'dark',
      colorScheme: 'rose'
    }
  },
  {
    id: 'salon-elegance',
    label: 'Salon Elegance',
    description: 'Soft rose and cream tones',
    theme: {
      presetId: 'salon-elegance',
      primaryColor: '#4a3728',
      accentColor: '#c9a89a',
      fontFamily: '"Palatino Linotype", Georgia, serif',
      borderRadius: '1rem',
      mode: 'light',
      colorScheme: 'rose'
    }
  },
  {
    id: 'photography-modern',
    label: 'Photography Modern',
    description: 'Monochrome with sharp accents',
    theme: {
      presetId: 'photography-modern',
      primaryColor: '#18181b',
      accentColor: '#38bdf8',
      fontFamily: 'Helvetica, Arial, sans-serif',
      borderRadius: '0.375rem',
      mode: 'dark',
      colorScheme: 'teal'
    }
  }
];

export const MOX_COLOR_SCHEMES: { id: PortfolioTheme['colorScheme']; label: string; accent: string }[] = [
  { id: 'amber', label: 'Amber', accent: '#ff6f00' },
  { id: 'teal', label: 'Teal', accent: '#00897b' },
  { id: 'rose', label: 'Rose', accent: '#e91e63' },
  { id: 'indigo', label: 'Indigo', accent: '#3949ab' },
  { id: 'green', label: 'Green', accent: '#43a047' },
  { id: 'slate', label: 'Slate', accent: '#546e7a' }
];

export function getThemePresetById(id: string): PortfolioThemePreset | undefined {
  return PORTFOLIO_THEME_PRESETS.find((p) => p.id === id);
}
