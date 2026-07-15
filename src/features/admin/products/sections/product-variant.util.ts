import { ProductTypeAttributeDto } from '@features/catalog/models/product-type.model';
import { InventoryItemDto, ProductDetailDto } from '@features/catalog/models/product-admin.model';

export interface VariantRow {
  id: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  barcode: string;
  weight: number | null;
  isActive: boolean;
  /** Attribute name to selected value, e.g. { Size: '10', Color: 'Red' }. */
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

export function variantAttributesFromRecord(attributes: Record<string, string>): VariantAttributeDisplay[] {
  return Object.entries(attributes).map(([name, value]) => ({ name, value }));
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
    attributeSelections: { ...v.attributes }
  }));
}

export function selectedAttributeNamesFromProduct(p: ProductDetailDto): Set<string> {
  const names = new Set<string>();
  p.variants.forEach((v) => Object.keys(v.attributes).forEach((name) => names.add(name)));
  return names;
}

export function attributeNamesFromRows(rows: VariantRow[]): Set<string> {
  const names = new Set<string>();
  rows.forEach((row) => Object.keys(row.attributeSelections).forEach((name) => names.add(name)));
  return names;
}

export function variantSelectionsKey(selections: Record<string, string>): string {
  return Object.entries(selections)
    .filter(([, value]) => !!value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => `${name}:${value}`)
    .join('|');
}

export function addVariantRow(
  rows: VariantRow[],
  attributeSelections: Record<string, string>,
  defaults: { price: number; compareAtPrice: number | null; weight: number | null }
): VariantRow[] {
  const selections = Object.fromEntries(
    Object.entries(attributeSelections).filter(([, value]) => !!value)
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

/** Cartesian product of every attribute's possible values, for products where the type defines dropdown attributes. */
export function generateVariantRows(
  attributes: ProductTypeAttributeDto[],
  selectedAttributeNames: Set<string>,
  defaults: { price: number; compareAtPrice: number | null; weight: number | null },
  existingRows: VariantRow[]
): VariantRow[] {
  const selected = attributes.filter((a) => selectedAttributeNames.has(a.name) && a.possibleValues.length > 0);
  if (!selected.length) return [];

  const combos: Record<string, string>[] = [{}];
  for (const attr of selected) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const val of attr.possibleValues) {
        next.push({ ...combo, [attr.name]: val });
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

export function variantLabel(row: VariantRow): string {
  return Object.entries(row.attributeSelections)
    .filter(([, value]) => !!value)
    .map(([name, value]) => `${name}: ${value}`)
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

export function stockRowsFromProduct(p: ProductDetailDto): VariantStockRow[] {
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
      attributeSelections: { ...v.attributes }
    };
    const inv = inventoryRowForVariant(p, v.id);
    const attributeItems = variantAttributesFromRecord(v.attributes);
    return {
      variantId: v.id,
      sku: v.sku,
      label: formatVariantAttributes(attributeItems) || variantLabel(row),
      attributes: attributeItems,
      inventoryId: inv?.id ?? null,
      quantityAvailable: inv?.quantityAvailable ?? 0,
      quantityReserved: inv?.quantityReserved ?? 0,
      lowStockThreshold: inv?.lowStockThreshold ?? 5
    };
  });
}
