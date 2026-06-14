export type PlanType = 'Starter' | 'Studio' | 'Master';
export type BillingCycle = 'Monthly' | 'Yearly';
export type SubscriptionStatus =
  | 'Pending'
  | 'Active'
  | 'Expired'
  | 'Cancelled'
  | 'Suspended'
  | 'Trialing';

export type ProductStatus = 'Draft' | 'Active' | 'Inactive' | 'Archived';
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';
export type OrderPaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentProvider = 'Stripe' | 'PayPal' | 'Razorpay' | 'Manual' | 'UPI' | 'COD';
export type PaymentTransactionStatus = 'Pending' | 'Success' | 'Failed' | 'Refunded';
export type ShipmentStatus =
  | 'Pending'
  | 'Packed'
  | 'Shipped'
  | 'InTransit'
  | 'Delivered'
  | 'Returned';
export type ReturnStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Shipped'
  | 'Received'
  | 'Completed';
export type DiscountType = 'Percentage' | 'FixedAmount';
export type PortfolioType = 'Image' | 'Video' | 'Document';
export type WebsitePageType = 'Home' | 'About' | 'Contact' | 'Shop' | 'Policies' | 'Custom';
export type WebsiteSectionType =
  | 'Hero'
  | 'FeaturedProducts'
  | 'FeaturedCategories'
  | 'ProductGrid'
  | 'RichText'
  | 'Testimonials'
  | 'PromoBanner'
  | 'PortfolioGallery'
  | 'ImageGallery'
  | 'CallToAction'
  | 'HeroBanner'
  | 'StoreDescription'
  | 'WhyChooseUs'
  | 'ContactSupport'
  | 'PaymentMethods'
  | 'StorePolicies'
  | 'NewsletterSignup'
  | 'TrustBadges';
