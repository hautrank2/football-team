import { badRequest } from "./http";

// Shared list-query parsing (api-conventions §1–6): pagination + sort + include
// are common to every entity; each route only adds its own filters.

export type ListQuery = {
  page: number;
  pageSize: number;
  sortBy: string;
  order: "asc" | "desc";
  populations: string[];
  skip: number;
};

export type ParseListOptions = {
  sortWhitelist: string[];
  populationWhitelist: string[];
  defaultSort?: string;
  maxPageSize?: number;
};

const toInt = (value: string | null, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

// Accept both repeated params (?p=a&p=b) and comma form (?p=a,b); trim + drop empty.
export const toArray = (sp: URLSearchParams, key: string): string[] =>
  sp
    .getAll(key)
    .flatMap((v) => v.split(","))
    .map((s) => s.trim())
    .filter(Boolean);

export const parseListQuery = (sp: URLSearchParams, opts: ParseListOptions): ListQuery => {
  const { sortWhitelist, populationWhitelist, defaultSort = "createdAt", maxPageSize = 200 } = opts;

  const page = Math.max(1, toInt(sp.get("page"), 1));
  const pageSize = clamp(toInt(sp.get("pageSize"), 20), 1, maxPageSize);

  const sortByRaw = sp.get("sortBy") ?? defaultSort;
  const sortBy = sortWhitelist.includes(sortByRaw) ? sortByRaw : defaultSort;
  const order: "asc" | "desc" = sp.get("order") === "asc" ? "asc" : "desc";

  const populations = toArray(sp, "populations").filter((p) => populationWhitelist.includes(p));

  return { page, pageSize, sortBy, order, populations, skip: (page - 1) * pageSize };
};

// populations → Prisma `include` (population names match relation field names).
export const buildInclude = (populations: string[]): Record<string, true> | undefined =>
  populations.length ? Object.fromEntries(populations.map((p) => [p, true])) : undefined;

// ---- Filter helpers (only emit a clause when the value is present) ----

// Partial, case-insensitive text match.
export const textFilter = (sp: URLSearchParams, key: string) => {
  const value = sp.get(key)?.trim();
  return value ? { contains: value, mode: "insensitive" as const } : undefined;
};

// Exact match (id / plain equality).
export const exact = (sp: URLSearchParams, key: string): string | undefined => {
  const value = sp.get(key)?.trim();
  return value || undefined;
};

// Exact enum match, validated against the enum's values (invalid → 400).
export const enumFilter = <T extends Record<string, string>>(
  sp: URLSearchParams,
  key: string,
  e: T
): T[keyof T] | undefined => {
  const value = sp.get(key)?.trim();
  if (!value) return undefined;
  if (!Object.values(e).includes(value)) throw badRequest(`Invalid ${key}: ${value}`);
  return value as T[keyof T];
};

export const boolFilter = (sp: URLSearchParams, key: string): boolean | undefined => {
  const value = sp.get(key)?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

// `<field>Ids` → { hasSome: [...] } (belongs-to-set). Undefined when empty.
export const idsFilter = (sp: URLSearchParams, key: string) => {
  const ids = toArray(sp, key);
  return ids.length ? { hasSome: ids } : undefined;
};

// start<Field>At / end<Field>At → { gte?, lte? }. Undefined when neither bound.
export const dateRange = (sp: URLSearchParams, field: string) => {
  const cap = field.charAt(0).toUpperCase() + field.slice(1);
  const start = sp.get(`start${cap}At`)?.trim();
  const end = sp.get(`end${cap}At`)?.trim();
  const range: { gte?: Date; lte?: Date } = {};
  if (start) range.gte = new Date(start);
  if (end) range.lte = new Date(end);
  return range.gte || range.lte ? range : undefined;
};
