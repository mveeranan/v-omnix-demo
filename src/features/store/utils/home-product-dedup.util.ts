export interface HomeProductDedupLimits {
  featuredMax: number;
  offerMax: number;
  saleMax: number;
}

export interface HomeProductDedupResult {
  featured: string[];
  offer: string[];
  sale: string[];
}

/** Filter pinned product IDs so each product appears at most once on the home page (Featured → Offer → Sale). */
export function dedupeHomeProductIds(
  featuredIds: string[],
  offerIds: string[],
  saleIds: string[],
  limits: HomeProductDedupLimits
): HomeProductDedupResult {
  const seen = new Set<string>();

  const takeUnique = (ids: string[], max: number): string[] => {
    const result: string[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      result.push(id);
      seen.add(id);
      if (result.length >= max) break;
    }
    return result;
  };

  const featured = takeUnique(featuredIds, limits.featuredMax);
  const offer = takeUnique(offerIds, limits.offerMax);
  const sale = takeUnique(saleIds, limits.saleMax);

  return { featured, offer, sale };
}
