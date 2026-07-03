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
  return errors?.find((e) => e.trim().length > 0);
}
