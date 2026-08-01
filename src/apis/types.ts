// Shared FE-side shape of the list envelope returned by every list endpoint.
export type TableResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
  items: T[];
};

export type ListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: "asc" | "desc";
};
