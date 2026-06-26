import { ProductAttributeDto } from '@features/catalog/models/product-attribute.model';
import { InventoryItemDto, ProductDetailDto } from '@features/catalog/models/product-admin.model';

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

export interface VariantAttributeDisplay {
  name: string;
  value: string;
}

export interface VariantStockRow {
  variantId: string | null;
  sku: string;
  label: string;
  attributes: VariantAttributeDisplay[];
  inventoryId: string | null;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
}

export function variantAttributesFromProductVariant(
  attributes: { attributeName: string; value: string }[]
): VariantAttributeDisplay[] {
  return attributes.map((a) => ({
    name: a.attributeName,
    value: a.value
  }));
}

export function previewVariantAttributes(
  attributes: VariantAttributeDisplay[],
  maxVisible = 2
): { visible: VariantAttributeDisplay[]; extraCount: number } {
  return {
    visible: attributes.slice(0, maxVisible),
    extraCount: Math.max(0, attributes.length - maxVisible)
  };
}

export function formatVariantAttributes(attributes: VariantAttributeDisplay[]): string {
  return attributes.map((a) => `${a.name}: ${a.value}`).join(', ');
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

export function attributeIdsFromRows(rows: VariantRow[]): Set<string> {
  const ids = new Set<string>();
  rows.forEach((row) => Object.keys(row.attributeSelections).forEach((id) => ids.add(id)));
  return ids;
}

export function variantSelectionsKey(selections: Record<string, string>): string {
  return Object.entries(selections)
    .filter(([, valueId]) => !!valueId)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([attributeId, valueId]) => `${attributeId}:${valueId}`)
    .join('|');
}

export function addVariantRow(
  rows: VariantRow[],
  attributeSelections: Record<string, string>,
  defaults: { price: number; compareAtPrice: number | null; weight: number | null }
): VariantRow[] {
  const selections = Object.fromEntries(
    Object.entries(attributeSelections).filter(([, valueId]) => !!valueId)
  );
  if (!Object.keys(selections).length) return rows;

  const key = variantSelectionsKey(selections);
  const isDuplicate = rows.some((row) => variantSelectionsKey(row.attributeSelections) === key);
  if (isDuplicate) return rows;

  return [
    ...rows,
    {
      id: null,
      sku: '',
      price: defaults.price,
      compareAtPrice: defaults.compareAtPrice,
      barcode: '',
      weight: defaults.weight,
      isActive: true,
      attributeSelections: selections
    }
  ];
}

export function removeVariantRow(rows: VariantRow[], index: number): VariantRow[] {
  return rows.filter((_, i) => i !== index);
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

export function simpleInventoryRow(p: ProductDetailDto): InventoryItemDto | undefined {
  return p.inventory.find((i) => !i.variantId);
}

export function inventoryRowForVariant(
  p: ProductDetailDto,
  variantId: string
): InventoryItemDto | undefined {
  return p.inventory.find((i) => i.variantId === variantId);
}

export function stockRowsFromProduct(p: ProductDetailDto, attributes: ProductAttributeDto[]): VariantStockRow[] {
  const activeVariants = p.variants.filter((v) => v.isActive);

  if (activeVariants.length === 0) {
    const inv = simpleInventoryRow(p);
    return [
      {
        variantId: null,
        sku: p.sku,
        label: 'Product',
        attributes: [],
        inventoryId: inv?.id ?? null,
        quantityAvailable: inv?.quantityAvailable ?? 0,
        quantityReserved: inv?.quantityReserved ?? 0,
        lowStockThreshold: inv?.lowStockThreshold ?? 5
      }
    ];
  }

  return activeVariants.map((v) => {
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
    const inv = inventoryRowForVariant(p, v.id);
    const attributeItems = variantAttributesFromProductVariant(v.attributes);
    return {
      variantId: v.id,
      sku: v.sku,
      label: formatVariantAttributes(attributeItems) || variantLabel(row, attributes),
      attributes: attributeItems,
      inventoryId: inv?.id ?? null,
      quantityAvailable: inv?.quantityAvailable ?? 0,
      quantityReserved: inv?.quantityReserved ?? 0,
      lowStockThreshold: inv?.lowStockThreshold ?? 5
    };
  });
}
