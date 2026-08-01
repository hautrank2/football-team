import { z } from "zod";
import { badRequest } from "./http";

// MongoDB ObjectId (24-hex).
export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// Parse + validate a JSON request body against a schema (throws ZodError → 400).
export const parseBody = async <T>(req: Request, schema: z.ZodType<T>): Promise<T> => {
  const json = await req.json().catch(() => {
    throw badRequest("Invalid JSON body");
  });
  return schema.parse(json);
};

// Validate a path param id.
export const parseId = (id: string): string => objectId.parse(id);
