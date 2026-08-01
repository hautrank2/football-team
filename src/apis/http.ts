// Thin fetch-based HTTP client. All resource APIs under `@/apis/<resource>`
// build on top of this — components never call `fetch` directly.

export type HttpError = {
  status: number;
  message: string;
  data?: unknown;
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  // Query params appended to the URL; undefined/null values are skipped.
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const buildUrl = (path: string, params?: RequestOptions["params"]): string => {
  const url = new URL(
    path.startsWith("http") ? path : `${BASE_URL}${path}`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin
  );
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
  }
  // Keep relative when no BASE_URL host was provided.
  return BASE_URL || path.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
};

const request = async <T>(method: string, path: string, options: RequestOptions = {}): Promise<T> => {
  const { params, body, headers, ...rest } = options;

  const res = await fetch(buildUrl(path, params), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...rest,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => undefined) : await res.text();

  if (!res.ok) {
    const error: HttpError = {
      status: res.status,
      message: (isJson && (payload as { message?: string })?.message) || res.statusText,
      data: payload,
    };
    throw error;
  }

  return payload as T;
};

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>("PUT", path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};
