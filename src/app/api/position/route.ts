import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import { buildInclude, parseListQuery, textFilter } from "@/lib/query";
import { created, ok, tableResponse } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { positionCreate } from "@/types";
import type { Prisma } from "@prisma/client";

const SORT = ["createdAt", "updatedAt", "code", "title"];
const POPULATE = ["players"];

// GET /api/position — list
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, { sortWhitelist: SORT, populationWhitelist: POPULATE });

  const where: Prisma.PositionWhereInput = {};
  const code = textFilter(sp, "code");
  const title = textFilter(sp, "title");
  if (code) where.code = code;
  if (title) where.title = title;

  const [items, total] = await Promise.all([
    prisma.position.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.position.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/position — create
export const POST = route(async (req) => {
  const data = await parseBody(req, positionCreate);
  return created(await prisma.position.create({ data }));
});
