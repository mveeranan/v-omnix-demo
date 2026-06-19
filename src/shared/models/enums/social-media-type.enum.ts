/** Matches backend SocialMediaType enum. */
export enum SocialMediaType {
  Instagram = 1,
  Facebook = 2,
  TikTok = 3,
  YouTube = 4,
  LinkedIn = 5,
  Website = 6,
  Twitter = 7,
  Other = 8
}

export const SOCIAL_MEDIA_TYPE_LABELS: Record<SocialMediaType, string> = {
  [SocialMediaType.Instagram]: 'Instagram',
  [SocialMediaType.Facebook]: 'Facebook',
  [SocialMediaType.TikTok]: 'TikTok',
  [SocialMediaType.YouTube]: 'YouTube',
  [SocialMediaType.LinkedIn]: 'LinkedIn',
  [SocialMediaType.Website]: 'Website',
  [SocialMediaType.Twitter]: 'Twitter',
  [SocialMediaType.Other]: 'Other'
};
