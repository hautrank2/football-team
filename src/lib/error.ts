// Pull a human-readable message off any thrown value — an Error, or the plain
// `HttpError` object our axios clients reject with.
export const errorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return fallback;
};
