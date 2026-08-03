import { NextResponse } from "next/server";
import type { ApiResponse, TableResponseDto } from "@/types";

// Success builders. Every endpoint returns the unified envelope; the payload
// goes in `metadata` so the http client can unwrap it uniformly.

const envelope = <T>(metadata: T, statusCode: number): ApiResponse<T> => ({
  statusCode,
  metadata,
  message: "OK",
  error: null,
});

export const ok = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json(envelope(data, init?.status ?? 200), init);

export const created = <T>(data: T) => NextResponse.json(envelope(data, 201), { status: 201 });

// No payload (e.g. DELETE). Uses 200 + null metadata since the envelope needs a body.
export const noContent = () => NextResponse.json(envelope<null>(null, 200));

// List envelope carried as `metadata` (see api-conventions §7).
export const tableResponse = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): TableResponseDto<T> => ({
  page,
  pageSize,
  total,
  totalPage: Math.ceil(total / pageSize),
  items,
});
