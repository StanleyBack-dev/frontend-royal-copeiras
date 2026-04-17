export interface ApiBaseResponse {
  success: boolean;
  message?: string | null;
  code?: string | null;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ApiMutationResponse<TData> extends ApiBaseResponse {
  data: TData;
}

export interface ApiListResponse<TItem>
  extends ApiBaseResponse, PaginationMeta {
  items: TItem[];
}
