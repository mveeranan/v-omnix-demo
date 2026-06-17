export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export function getFirstApiError(errors?: string[]): string | undefined {
  return errors?.find((e) => e.trim().length > 0);
}
