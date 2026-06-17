import { Portfolio, PortfolioGalleryItem, PortfolioReview } from '../models/portfolio.model';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_RE = /^\d{10}$/;

export function validateBrand(brand: Portfolio['brand'], primaryColor: string): ValidationResult {
  const errors: string[] = [];
  const name = brand.businessName?.trim() ?? '';
  if (brand.enabled) {
    if (name.length < 3) {
      errors.push('Business name is required (minimum 3 characters).');
    }
    if (!brand.logoUrl?.trim()) {
      errors.push('Logo must be uploaded when the brand section is enabled.');
    }
    if (!primaryColor?.trim()) {
      errors.push('Primary color is required.');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateStoreDescription(section: Portfolio['storeDescription']): ValidationResult {
  const errors: string[] = [];
  if (section.enabled) {
    const desc = section.description?.trim() ?? '';
    if (desc.length < 10) {
      errors.push('Store description must be at least 10 characters.');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateGallery(
  section: Portfolio['gallerySection'],
  items: PortfolioGalleryItem[]
): ValidationResult {
  const errors: string[] = [];
  if (section.enabled) {
    const imageCount = items.filter((i) => i.type === 'image').length;
    if (imageCount < 3) {
      errors.push('Gallery needs at least 3 images when enabled.');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateReviews(
  section: Portfolio['reviewsSection'],
  items: PortfolioReview[]
): ValidationResult {
  const errors: string[] = [];
  if (section.enabled && items.length) {
    for (const review of items) {
      if (review.rating < 1 || review.rating > 5 || !Number.isInteger(review.rating)) {
        errors.push(`Review by "${review.author || 'Unknown'}" must have a rating between 1 and 5.`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateContactSupport(section: Portfolio['contactSupport']): ValidationResult {
  const errors: string[] = [];
  if (!section.enabled) {
    return { valid: true, errors };
  }
  const phone = section.phone?.replace(/\D/g, '') ?? '';
  if (phone && !PHONE_RE.test(phone)) {
    errors.push('Phone must be a valid 10-digit number.');
  }
  const email = section.email?.trim() ?? '';
  if (email && !EMAIL_RE.test(email)) {
    errors.push('Email format is invalid.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateFeaturedProducts(section: Portfolio['featuredProducts']): ValidationResult {
  const errors: string[] = [];
  if (section.enabled) {
    if (section.maxCount < 1 || section.maxCount > 12) {
      errors.push('Featured product count must be between 1 and 12.');
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validatePublish(slug: string): ValidationResult {
  const errors: string[] = [];
  const normalized = slug?.trim() ?? '';
  if (!normalized) {
    errors.push('Store URL slug is required.');
  } else if (!SLUG_RE.test(normalized)) {
    errors.push('Slug may only contain lowercase letters, numbers, and hyphens.');
  }
  return { valid: errors.length === 0, errors };
}

export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
