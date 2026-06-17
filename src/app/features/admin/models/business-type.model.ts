/** Normalized shape used across admin UI (matches /business-types API). */
export interface BusinessTypeDto {
  id: string;
  name: string;
}

/** Raw API item shapes (PascalCase or legacy aliases). */
export interface BusinessTypeApiDto {
  id?: string;
  typeId?: string;
  Id?: string;
  name?: string;
  typeName?: string;
  Name?: string;
}

export function mapBusinessType(dto: BusinessTypeApiDto): BusinessTypeDto {
  return {
    id: (dto.id ?? dto.typeId ?? dto.Id ?? '').trim(),
    name: (dto.name ?? dto.typeName ?? dto.Name ?? '').trim()
  };
}
