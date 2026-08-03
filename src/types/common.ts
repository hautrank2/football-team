import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared query + list types (see .agents/rules/api/api-conventions.md).
// ---------------------------------------------------------------------------

// Common list-query params every list endpoint accepts (pagination + sort).
export type ListQueryDto = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: "asc" | "desc";
};

// List envelope returned as the `metadata` of every list endpoint.
export type TableResponseDto<T> = {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
  items: T[];
};

// MongoDB ObjectId (24-hex). Shared by request schemas + path-param validation.
export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
