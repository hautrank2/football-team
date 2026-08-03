import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import { buildInclude, exact, parseListQuery, textFilter } from "@/lib/query";
import { created, ok, tableResponse } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { quoteCreate } from "@/types";

const SORT = ["createdAt"];
const POPULATE = ["subject", "author"];

// GET /api/quote — list
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, { sortWhitelist: SORT, populationWhitelist: POPULATE });

  const where: Prisma.PlayerQuoteWhereInput = {};
  const content = textFilter(sp, "content");
  const subjectId = exact(sp, "subjectId");
  const authorId = exact(sp, "authorId");
  if (content) where.content = content;
  if (subjectId) where.subjectId = subjectId;
  if (authorId) where.authorId = authorId;

  const [items, total] = await Promise.all([
    prisma.playerQuote.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.playerQuote.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/quote — create (one quote per author+subject; duplicate → 409)
export const POST = route(async (req) => {
  const data = await parseBody(req, quoteCreate);
  return created(await prisma.playerQuote.create({ data }));
});
