/** Normalized shape used across admin UI (matches /business-types API). */
export interface BusinessTypeDto {
  id: string;
  name: string;
}

export interface BusinessGroupDto {
  groupId: string;
  groupName: string;
  types: BusinessTypeDto[];
}

/** Raw API item shapes (PascalCase or legacy aliases). */
export interface BusinessTypeApiDto {
  id?: string;
  typeId?: string;
  name?: string;
  typeName?: string;
}

export interface BusinessGroupApiDto {
  groupId?: string;
  id?: string;
  groupName?: string;
  name?: string;
  types?: BusinessTypeApiDto[];
}

export function mapBusinessType(dto: BusinessTypeApiDto): BusinessTypeDto {
  return {
    id: (dto.id ?? dto.typeId ?? '').trim(),
    name: (dto.name ?? dto.typeName ?? '').trim()
  };
}

export function mapBusinessGroup(dto: BusinessGroupApiDto): BusinessGroupDto {
  return {
    groupId: (dto.groupId ?? dto.id ?? '').trim(),
    groupName: (dto.groupName ?? dto.name ?? '').trim(),
    types: (dto.types ?? []).map(mapBusinessType).filter((t) => t.id.length > 0)
  };
}
