import { LineupSize, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { route } from "@/server/http";
import {
  boolFilter,
  buildInclude,
  enumFilter,
  exact,
  parseListQuery,
  textFilter,
} from "@/server/query";
import { created, ok, tableResponse } from "@/server/response";
import { parseBody } from "@/server/validation";
import { lineupCreate } from "@/server/schemas";

const SORT = ["createdAt", "updatedAt", "name"];
const POPULATE = ["owner", "comments"];

// GET /api/lineup — list
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, { sortWhitelist: SORT, populationWhitelist: POPULATE });

  const where: Prisma.LineupWhereInput = {};
  const name = textFilter(sp, "name");
  const ownerId = exact(sp, "ownerId");
  const size = enumFilter(sp, "size", LineupSize);
  const isPublic = boolFilter(sp, "isPublic");
  if (name) where.name = name;
  if (ownerId) where.ownerId = ownerId;
  if (size) where.size = size;
  if (isPublic !== undefined) where.isPublic = isPublic;

  const [items, total] = await Promise.all([
    prisma.lineup.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.lineup.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/lineup — create
export const POST = route(async (req) => {
  const data = await parseBody(req, lineupCreate);
  return created(await prisma.lineup.create({ data }));
});
