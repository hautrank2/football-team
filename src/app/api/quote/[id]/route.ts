import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { buildInclude, toArray } from "@/server/query";
import { noContent, ok } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { quoteUpdate } from "@/server/schemas";

const POPULATE = ["subject", "author"];
type Params = { id: string };

// GET /api/quote/:id
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const populations = toArray(new URL(req.url).searchParams, "populations").filter((p) =>
    POPULATE.includes(p)
  );
  const quote = await prisma.playerQuote.findUnique({
    where: { id },
    include: buildInclude(populations),
  });
  if (!quote) throw notFound("Quote");
  return ok(quote);
});

// PATCH /api/quote/:id
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const data = await parseBody(req, quoteUpdate);
  return ok(await prisma.playerQuote.update({ where: { id }, data }));
});

// DELETE /api/quote/:id
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  await prisma.playerQuote.delete({ where: { id } });
  return noContent();
});
