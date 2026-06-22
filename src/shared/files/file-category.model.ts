import { FileCategory } from './file-category.enum';

export class FileCategoryModel {
  constructor(
    public readonly id: FileCategory,
    public readonly name: string
  ) {}
}

export const FILE_CATEGORY_MODELS: FileCategoryModel[] = [
  new FileCategoryModel(FileCategory.Unknown, 'Unknown'),
  new FileCategoryModel(FileCategory.ProfileImage, 'ProfileImage'),
  new FileCategoryModel(FileCategory.BusinessLogo, 'BusinessLogo'),
  new FileCategoryModel(FileCategory.PortfolioImage, 'PortfolioImage'),
  new FileCategoryModel(FileCategory.PortfolioVideo, 'PortfolioVideo'),
  new FileCategoryModel(FileCategory.BookingAttachment, 'BookingAttachment'),
  new FileCategoryModel(FileCategory.InvoiceDocument, 'InvoiceDocument'),
  new FileCategoryModel(FileCategory.IdentityVerification, 'IdentityVerification'),
  new FileCategoryModel(FileCategory.ChatAttachment, 'ChatAttachment'),
  new FileCategoryModel(FileCategory.BannerImage, 'BannerImage'),
  new FileCategoryModel(FileCategory.PaymentReceipt, 'PaymentReceipt'),
  new FileCategoryModel(FileCategory.ServiceMediaImage, 'ServiceMediaImage'),
  new FileCategoryModel(FileCategory.ServiceMediaVideo, 'ServiceMediaVideo'),
  new FileCategoryModel(FileCategory.ProductImage, 'ProductImage'),
  new FileCategoryModel(FileCategory.BrandLogo, 'BrandLogo'),
  new FileCategoryModel(FileCategory.HeroSlide, 'HeroSlide')
];

