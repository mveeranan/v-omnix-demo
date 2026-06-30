/** Sections editable in /admin/website — drives the marketing landing page only. */
export type WebsiteSectionId =
  | 'brand'
  | 'hero'
  | 'categoryShowcase'
  | 'whyChooseUs'
  | 'stats'
  | 'contactSupport'
  | 'social'
  | 'theme'
  | 'publish';

/** Content tab order — each maps 1:1 to a block on the store home (marketing) page. */
export const WEBSITE_CONTENT_SECTIONS: WebsiteSectionId[] = [
  'brand',
  'hero',
  'categoryShowcase',
  'whyChooseUs',
  'stats',
  'contactSupport',
  'social'
];
