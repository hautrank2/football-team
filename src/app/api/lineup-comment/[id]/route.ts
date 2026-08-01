import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { buildInclude, toArray } from "@/server/query";
import { noContent, ok } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { lineupCommentUpdate } from "@/server/schemas";

const POPULATE = ["author", "lineup"];
type Params = { id: string };

// GET /api/lineup-comment/:id
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const populations = toArray(new URL(req.url).searchParams, "populations").filter((p) =>
    POPULATE.includes(p)
  );
  const comment = await prisma.lineupComment.findUnique({
    where: { id },
    include: buildInclude(populations),
  });
  if (!comment) throw notFound("Comment");
  return ok(comment);
});

// PATCH /api/lineup-comment/:id
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const data = await parseBody(req, lineupCommentUpdate);
  return ok(await prisma.lineupComment.update({ where: { id }, data }));
});

// DELETE /api/lineup-comment/:id
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  await prisma.lineupComment.delete({ where: { id } });
  return noContent();
});
