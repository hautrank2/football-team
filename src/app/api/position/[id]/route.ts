import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/lib/route";
import { buildInclude, toArray } from "@/lib/query";
import { noContent, ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { positionUpdate } from "@/types";

const POPULATE = ["players"];
type Params = { id: string };

// GET /api/position/:id
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const populations = toArray(new URL(req.url).searchParams, "populations").filter((p) =>
    POPULATE.includes(p)
  );
  const position = await prisma.position.findUnique({
    where: { id },
    include: buildInclude(populations),
  });
  if (!position) throw notFound("Position");
  return ok(position);
});

// PATCH /api/position/:id
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const data = await parseBody(req, positionUpdate);
  return ok(await prisma.position.update({ where: { id }, data }));
});

// DELETE /api/position/:id
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  await prisma.position.delete({ where: { id } });
  return noContent();
});
