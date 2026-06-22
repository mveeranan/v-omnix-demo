export enum ProductStatus {
  Draft = 1,
  Active = 2,
  Inactive = 3,
  Archived = 4
}

const STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.Draft]: 'Draft',
  [ProductStatus.Active]: 'Active',
  [ProductStatus.Inactive]: 'Inactive',
  [ProductStatus.Archived]: 'Archived'
};

export function productStatusLabel(status: ProductStatus): string {
  return STATUS_LABELS[status] ?? 'Unknown';
}

export function parseProductStatus(value: string | number | null | undefined): ProductStatus | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'number') return value as ProductStatus;
  const lower = value.toLowerCase();
  const map: Record<string, ProductStatus> = {
    draft: ProductStatus.Draft,
    active: ProductStatus.Active,
    inactive: ProductStatus.Inactive,
    archived: ProductStatus.Archived,
    '1': ProductStatus.Draft,
    '2': ProductStatus.Active,
    '3': ProductStatus.Inactive,
    '4': ProductStatus.Archived
  };
  return map[lower];
}
