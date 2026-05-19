import { PortfolioTheme } from './portfolio.model';

export interface PortfolioThemePreset {
  id: string;
  label: string;
  description: string;
  theme: PortfolioTheme;
}

export const PORTFOLIO_THEME_PRESETS: PortfolioThemePreset[] = [
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
      mode: 'dark'
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
      mode: 'light'
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
      mode: 'dark'
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
      mode: 'light'
    }
  },
  {
    id: 'photography-modern',
    label: 'Photography Modern',
    description: 'Monochrome with sharp accents',
    theme: {
      presetId: 'photography-modern',
      primaryColor: '#18181b',
      accentColor: '#fafafa',
      fontFamily: 'Helvetica, Arial, sans-serif',
      borderRadius: '0.375rem',
      mode: 'dark'
    }
  }
];

export function getThemePresetById(id: string): PortfolioThemePreset | undefined {
  return PORTFOLIO_THEME_PRESETS.find((p) => p.id === id);
}
