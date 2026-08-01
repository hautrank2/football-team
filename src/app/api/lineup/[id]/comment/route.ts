import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { buildInclude, exact, parseListQuery } from "@/server/query";
import { created, ok, tableResponse } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { lineupCommentCreate } from "@/server/schemas";

const SORT = ["createdAt"];
const POPULATE = ["author"];
type Params = { id: string };

// GET /api/lineup/:id/comment — list comments of a lineup
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, { sortWhitelist: SORT, populationWhitelist: POPULATE });

  const where: Prisma.LineupCommentWhereInput = { lineupId: id };
  const authorId = exact(sp, "authorId");
  const parentId = exact(sp, "parentId");
  if (authorId) where.authorId = authorId;
  if (parentId) where.parentId = parentId;

  const [items, total] = await Promise.all([
    prisma.lineupComment.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.lineupComment.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/lineup/:id/comment — add a comment
export const POST = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { authorId, content, parentId } = await parseBody(req, lineupCommentCreate);

  const [lineup, author] = await Promise.all([
    prisma.lineup.findUnique({ where: { id }, select: { id: true } }),
    prisma.player.findUnique({ where: { id: authorId }, select: { id: true } }),
  ]);
  if (!lineup) throw notFound("Lineup");
  if (!author) throw notFound("Author");

  const comment = await prisma.lineupComment.create({
    data: { lineupId: id, authorId, content, parentId },
  });
  return created(comment);
});
