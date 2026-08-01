import { NextResponse } from "next/server";

// List envelope shared by every list endpoint (api-conventions §7).
export type TableResponse<T> = {
  page: number;
  pageSize: number;
  total: number;
  totalPage: number;
  items: T[];
};

export const tableResponse = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): TableResponse<T> => ({
  page,
  pageSize,
  total,
  totalPage: Math.ceil(total / pageSize),
  items,
});

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
export const created = <T>(data: T) => NextResponse.json(data, { status: 201 });
export const noContent = () => new NextResponse(null, { status: 204 });
