export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors?: Record<string, string[]>;
}

export interface PagedResultDto<T> {
  items?: T[] | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
