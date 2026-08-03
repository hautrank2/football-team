import { z } from "zod";
import { objectId } from "@/types";
import { badRequest } from "./route";

// Parse + validate a JSON request body against a schema (throws ZodError → 400).
export const parseBody = async <T>(req: Request, schema: z.ZodType<T>): Promise<T> => {
  const json = await req.json().catch(() => {
    throw badRequest("Invalid JSON body");
  });
  return schema.parse(json);
};

// Validate a path param id.
export const parseId = (id: string): string => objectId.parse(id);
