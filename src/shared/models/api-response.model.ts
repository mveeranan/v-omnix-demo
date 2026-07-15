export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

/** Matches WorkOrbit.Shared.Common.PagedResponse<T> on the backend. */
export interface PagedResponse<T> extends ApiResponse<T[]> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export function getFirstApiError(errors?: string[]): string | undefined {
  // Defensive: `errors` is typed as string[], but any response path that doesn't go through
  // this app's ApiResponse contract (e.g. a raw framework error body) could still hand us
  // something else at runtime. Guard against that instead of throwing on `.find`.
  if (!Array.isArray(errors)) {
    return undefined;
  }
  return errors.find((e) => typeof e === 'string' && e.trim().length > 0);
}
