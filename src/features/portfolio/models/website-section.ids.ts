/** Sections editable in /admin/website — drives the store home page. */
export type WebsiteSectionId =
  | 'brand'
  | 'hero'
  | 'announcementBar'
  | 'trustBadges'
  | 'categoryShowcase'
  | 'newArrivals'
  | 'dealOfWeek'
  | 'featuredProducts'
  | 'reviewsSection'
  | 'gallerySection'
  | 'newsletter'
  | 'whyChooseUs'
  | 'stats'
  | 'brandStrip'
  | 'faq'
  | 'contactSupport'
  | 'social'
  | 'theme'
  | 'publish';

/** Content tab order — each maps 1:1 to a block on the store home page. */
export const WEBSITE_CONTENT_SECTIONS: WebsiteSectionId[] = [
  'brand',
  'hero',
  'announcementBar',
  'trustBadges',
  'categoryShowcase',
  'newArrivals',
  'dealOfWeek',
  'featuredProducts',
  'reviewsSection',
  'gallerySection',
  'newsletter',
  'whyChooseUs',
  'stats',
  'brandStrip',
  'faq',
  'contactSupport',
  'social'
];
