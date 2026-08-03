import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import type { ApiError as ApiErrorMessage, ApiResponse } from "@/types";

// Thrown by handlers to short-circuit with a specific HTTP status.
export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (what = "Resource") => new ApiError(404, `${what} not found`);
export const badRequest = (msg: string, details?: unknown) => new ApiError(400, msg, details);

// Build the error envelope (see .agents/rules/api/api-conventions.md §9).
const fail = (
  statusCode: number,
  message: ApiErrorMessage,
  error: unknown
): NextResponse<ApiResponse<null>> =>
  NextResponse.json({ statusCode, metadata: null, message, error }, { status: statusCode });

// Maps any thrown value to the unified error envelope with the right status.
const toResponse = (e: unknown, path: string): NextResponse<ApiResponse<null>> => {
  if (e instanceof ApiError) return fail(e.statusCode, e.message, e.details ?? null);

  if (e instanceof ZodError) {
    const message = e.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return fail(400, message, null);
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002")
      return fail(409, "Duplicate value violates a unique constraint", { code: e.code });
    if (e.code === "P2025") return fail(404, "Resource not found", { code: e.code });
  }

  // Unhandled: log it, and surface details in development only (never in prod).
  const err = e instanceof Error ? e : new Error(String(e));
  console.error(`[api] 500 ${path}:`, err);

  const isDev = process.env.NODE_ENV !== "production";
  return fail(
    500,
    isDev ? err.message || "Internal server error" : "Internal server error",
    isDev ? { name: err.name, stack: err.stack?.split("\n").slice(0, 6) } : null
  );
};

type RouteContext<P> = { params: Promise<P> };
type Handler<P> = (req: Request, ctx: RouteContext<P>) => Promise<NextResponse> | Promise<Response>;

// Wraps a route handler so every thrown error becomes a consistent envelope.
export const route =
  <P = Record<string, string>>(handler: Handler<P>) =>
  async (req: Request, ctx: RouteContext<P>): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      return toResponse(e, new URL(req.url).pathname);
    }
  };
