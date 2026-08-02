import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

// Error envelope shared by every endpoint (see api-conventions §9).
export type ErrorEnvelope = {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message?: unknown[];
};

// Thrown by handlers to short-circuit with a specific HTTP status.
export class ApiError extends Error {
  statusCode: number;
  details?: unknown[];

  constructor(statusCode: number, message: string, details?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (what = "Resource") => new ApiError(404, `${what} not found`);
export const badRequest = (msg: string, details?: unknown[]) => new ApiError(400, msg, details);

const envelope = (
  statusCode: number,
  path: string,
  error: string,
  message?: unknown[]
): NextResponse<ErrorEnvelope> =>
  NextResponse.json(
    {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      error,
      ...(message ? { message } : {}),
    },
    { status: statusCode }
  );

// Maps any thrown value to the error envelope with the right status.
const toResponse = (e: unknown, path: string): NextResponse<ErrorEnvelope> => {
  if (e instanceof ApiError) return envelope(e.statusCode, path, e.message, e.details);

  if (e instanceof ZodError) {
    const message = e.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return envelope(400, path, "Validation failed", message);
  }

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return envelope(409, path, "Duplicate value violates a unique constraint");
    if (e.code === "P2025") return envelope(404, path, "Resource not found");
  }

  // Unhandled: log it, and surface details in development only (never in prod).
  const err = e instanceof Error ? e : new Error(String(e));
  console.error(`[api] 500 ${path}:`, err);

  const isDev = process.env.NODE_ENV !== "production";
  return envelope(
    500,
    path,
    isDev ? err.message || "Internal server error" : "Internal server error",
    isDev ? [{ name: err.name, stack: err.stack?.split("\n").slice(0, 6) }] : undefined
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
