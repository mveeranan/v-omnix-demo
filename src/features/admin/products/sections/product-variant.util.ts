import { ProductAttributeDto } from '@features/catalog/models/product-attribute.model';
import { ProductDetailDto } from '@features/catalog/models/product-admin.model';

export interface VariantRow {
  id: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  barcode: string;
  weight: number | null;
  isActive: boolean;
  attributeSelections: Record<string, string>;
}

export interface VariantStockRow {
  variantId: string;
  sku: string;
  label: string;
  quantityAvailable: number;
  lowStockThreshold: number;
}

export function variantRowsFromProduct(p: ProductDetailDto): VariantRow[] {
  if (!p.variants.length) return [];
  return p.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    barcode: v.barcode ?? '',
    weight: v.weight,
    isActive: v.isActive,
    attributeSelections: Object.fromEntries(v.attributes.map((a) => [a.attributeId, a.valueId]))
  }));
}

export function selectedAttributeIdsFromProduct(p: ProductDetailDto): Set<string> {
  const ids = new Set<string>();
  p.variants.forEach((v) => v.attributes.forEach((a) => ids.add(a.attributeId)));
  return ids;
}

export function generateVariantRows(
  attributes: ProductAttributeDto[],
  selectedAttributeIds: Set<string>,
  defaults: { price: number; compareAtPrice: number | null; weight: number | null },
  existingRows: VariantRow[]
): VariantRow[] {
  const selected = attributes.filter((a) => selectedAttributeIds.has(a.id));
  if (!selected.length) return [];

  const combos: Record<string, string>[] = [{}];
  for (const attr of selected) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const val of attr.values) {
        next.push({ ...combo, [attr.id]: val.id });
      }
    }
    combos.splice(0, combos.length, ...next);
  }

  return combos.map((combo) => {
    const existing = existingRows.find((row) =>
      Object.entries(combo).every(([k, v]) => row.attributeSelections[k] === v)
    );
    return {
      id: existing?.id ?? null,
      sku: existing?.sku ?? '',
      price: existing?.price ?? defaults.price,
      compareAtPrice: existing?.compareAtPrice ?? defaults.compareAtPrice,
      barcode: existing?.barcode ?? '',
      weight: existing?.weight ?? defaults.weight,
      isActive: existing?.isActive ?? true,
      attributeSelections: combo
    };
  });
}

export function variantLabel(row: VariantRow, attributes: ProductAttributeDto[]): string {
  return Object.entries(row.attributeSelections)
    .map(([attrId, valId]) => {
      const attr = attributes.find((a) => a.id === attrId);
      const val = attr?.values.find((v) => v.id === valId);
      return val ? `${attr?.name}: ${val.value}` : '';
    })
    .filter(Boolean)
    .join(', ');
}

export function stockRowsFromProduct(p: ProductDetailDto, attributes: ProductAttributeDto[]): VariantStockRow[] {
  return p.variants
    .filter((v) => v.isActive)
    .map((v) => {
      const row: VariantRow = {
        id: v.id,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        barcode: v.barcode ?? '',
        weight: v.weight,
        isActive: v.isActive,
        attributeSelections: Object.fromEntries(v.attributes.map((a) => [a.attributeId, a.valueId]))
      };
      const inv = p.inventory.find((i) => i.variantId === v.id);
      return {
        variantId: v.id,
        sku: v.sku,
        label: variantLabel(row, attributes),
        quantityAvailable: inv?.quantityAvailable ?? 0,
        lowStockThreshold: inv?.lowStockThreshold ?? 5
      };
    });
}
