import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { buildInclude, toArray } from "@/server/query";
import { noContent, ok } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { teamUpdate } from "@/server/schemas";

const POPULATE = ["players"];
type Params = { id: string };

// GET /api/team/:id
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const populations = toArray(new URL(req.url).searchParams, "populations").filter((p) =>
    POPULATE.includes(p)
  );
  const team = await prisma.team.findUnique({ where: { id }, include: buildInclude(populations) });
  if (!team) throw notFound("Team");
  return ok(team);
});

// PATCH /api/team/:id
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const data = await parseBody(req, teamUpdate);
  return ok(await prisma.team.update({ where: { id }, data }));
});

// DELETE /api/team/:id
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  await prisma.team.delete({ where: { id } });
  return noContent();
});
