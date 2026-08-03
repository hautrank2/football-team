// ---------------------------------------------------------------------------
// Unified API envelope. Every endpoint — success or error — returns this shape;
// the http client unwraps `metadata` for callers.
// ---------------------------------------------------------------------------

// Human-facing message. Flexible on purpose: a string, a list of field errors,
// or a structured object, depending on the endpoint.
export type ApiError = string | string[] | Record<string, unknown> | unknown[];

export type ApiResponse<T> = {
  statusCode: number;
  metadata: T; // payload on success; null on error
  message: ApiError; // human-facing message
  error: unknown; // real error detail for debugging; null on success
};

// Shape thrown by the FE http client on a non-2xx response.
export type HttpError = {
  status: number;
  message: ApiError;
  error: unknown;
};
