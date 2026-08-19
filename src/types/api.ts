export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: ApiError | null;
}

export interface BaseQueryParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
}
