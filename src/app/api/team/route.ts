import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import { buildInclude, parseListQuery, textFilter } from "@/lib/query";
import { created, ok, tableResponse } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { teamCreate } from "@/types";
import type { Prisma } from "@prisma/client";

const SORT = ["createdAt", "updatedAt", "name"];
const POPULATE = ["players"];

// GET /api/team — list
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, { sortWhitelist: SORT, populationWhitelist: POPULATE });

  const where: Prisma.TeamWhereInput = {};
  const name = textFilter(sp, "name");
  if (name) where.name = name;

  const [items, total] = await Promise.all([
    prisma.team.findMany({
      where,
      // No sort — teams are returned in natural (insertion) order.
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.team.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/team — create
export const POST = route(async (req) => {
  const data = await parseBody(req, teamCreate);
  return created(await prisma.team.create({ data }));
});
