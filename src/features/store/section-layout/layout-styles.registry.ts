/**
 * Frontend-owned catalog of layout styles per section type.
 *
 * This is DEVELOPER-owned code, not business data — adding a new layout style
 * is a frontend deploy (new entry here + a component in section-layout-map.ts),
 * never a DB migration or API change. The backend only stores the chosen style
 * id as a plain string on WebsiteSection.LayoutStyle and returns it verbatim.
 *
 * `sectionKey` matches the key the section's content lives under in the
 * assembled Portfolio object (e.g. "categoryShowcase"), which is also the key
 * the backend injects layoutStyle/displayName/itemLimit onto.
 */
export interface LayoutStyleDefinition {
  /** Stable id stored in WebsiteSection.LayoutStyle, e.g. "image-grid". */
  id: string;
  /** Human label shown in the admin style picker. */
  label: string;
  /** Optional short hint describing the layout. */
  hint?: string;
}

/** Available layout styles keyed by the portfolio section key. */
export const LAYOUT_STYLES: Record<string, LayoutStyleDefinition[]> = {
  categoryShowcase: [
    { id: 'image-grid', label: 'Image Grid', hint: 'Asymmetric mosaic / uniform image cards' },
    { id: 'horizontal-scroll', label: 'Horizontal Scroll Cards', hint: 'Swipeable row of cards' },
    { id: 'circular-cards', label: 'Circular Category Cards', hint: 'Round thumbnails with labels' },
    { id: 'icon-grid', label: 'Small Icon Grid', hint: 'Compact icon tiles' },
    { id: 'large-banner', label: 'Large Banner Categories', hint: 'Full-width banner blocks' },
    { id: 'masonry', label: 'Masonry Grid', hint: 'Mixed-height tiles' },
    { id: 'carousel', label: 'Carousel / Slider', hint: 'Auto-rotating slider' },
    { id: 'list', label: 'List View', hint: 'Vertical text-forward list' }
  ],
  featuredProducts: [
    { id: 'standard-grid', label: 'Standard Grid', hint: 'Classic product card grid' },
    { id: 'carousel', label: 'Horizontal Carousel', hint: 'Swipeable row of product cards' },
    { id: 'compact-list', label: 'Compact List', hint: 'Image / name / price rows' },
    { id: 'hero-grid', label: 'Large Hero + Grid', hint: 'First product large, rest in a small grid' },
    { id: 'masonry', label: 'Masonry', hint: 'Mixed-height image tiles' }
  ],
  newArrivals: [
    { id: 'grid', label: 'Standard Grid', hint: 'Centered heading + classic product grid' },
    { id: 'carousel', label: 'Horizontal Carousel', hint: 'Swipeable row, "Just In" eyebrow' },
    { id: 'compact-list', label: 'Compact List', hint: 'Image / name / price rows with a New tag' },
    { id: 'side-nav-slider', label: 'Slider with Side Navigation', hint: 'One large product + thumbnail rail' },
    { id: 'masonry', label: 'Masonry', hint: 'Mixed-height tiles, each tagged New' }
  ],
  gallerySection: [
    { id: 'instagram-grid', label: 'Instagram Grid', hint: 'Full-bleed 6-across square tiles' },
    { id: 'masonry', label: 'Masonry', hint: 'Mixed-height tiles' },
    { id: 'carousel', label: 'Carousel / Slider', hint: 'Swipeable horizontal row' },
    { id: 'bordered-cards', label: 'Bordered Card Grid', hint: 'Spaced cards with captions' },
    { id: 'slideshow', label: 'Full-Bleed Slideshow', hint: 'One large image at a time, with dots' }
  ],
  reviewsSection: [
    { id: 'spotlight', label: 'Single Quote Spotlight', hint: 'One testimonial at a time, auto-rotating' },
    { id: 'card-grid', label: 'Card Grid (3-up)', hint: 'All testimonials visible as cards' },
    { id: 'carousel', label: 'Carousel / Slider', hint: 'Swipeable row of testimonial cards' },
    { id: 'side-by-side', label: 'Side-by-Side with Photo', hint: 'Large avatar beside the quote' },
    { id: 'marquee', label: 'Marquee / Ticker Scroll', hint: 'Continuously drifting single row' }
  ],
  trustBadges: [
    { id: 'icon-row', label: 'Icon Row', hint: 'Large icons, responsive 3-column row' },
    { id: 'icon-grid', label: 'Small Icon Grid', hint: 'Compact 4-6 across tiles' },
    { id: 'bordered-cards', label: 'Bordered Cards', hint: 'Each badge in its own boxed card' },
    { id: 'text-list', label: 'Minimal Text List', hint: 'Single inline row, no boxes' },
    { id: 'numbered-steps', label: 'Numbered Steps', hint: 'Shown as 01, 02, 03 steps' }
  ],
  dealOfWeek: [
    { id: 'carousel', label: 'Carousel', hint: 'Swipeable rotating slides with countdown' },
    { id: 'spotlight', label: 'Single Deal Spotlight', hint: 'One deal, no rotation' },
    { id: 'compact-list', label: 'Compact List', hint: 'All active deals as rows' },
    { id: 'grid-cards', label: 'Grid Cards', hint: 'All active deals as a card grid' },
    { id: 'minimal-bar', label: 'Minimal Countdown Bar', hint: 'Thin strip, no image' }
  ]
};

/**
 * The style each section falls back to when WebsiteSection.LayoutStyle is null.
 * By design this id maps to the component that reproduces today's exact
 * appearance, so existing sections render unchanged until an admin picks a
 * different style.
 */
export const DEFAULT_LAYOUT_STYLE: Record<string, string> = {
  categoryShowcase: 'image-grid',
  featuredProducts: 'standard-grid',
  newArrivals: 'grid',
  gallerySection: 'instagram-grid',
  reviewsSection: 'spotlight',
  trustBadges: 'icon-row',
  dealOfWeek: 'carousel'
};

/** Resolve the effective style id for a section, applying the default fallback. */
export function resolveLayoutStyle(sectionKey: string, chosen?: string | null): string {
  if (chosen && LAYOUT_STYLES[sectionKey]?.some((s) => s.id === chosen)) {
    return chosen;
  }
  return DEFAULT_LAYOUT_STYLE[sectionKey] ?? '';
}
