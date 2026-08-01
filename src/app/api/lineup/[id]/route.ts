import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { buildInclude, toArray } from "@/server/query";
import { noContent, ok } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { lineupUpdate } from "@/server/schemas";

const POPULATE = ["owner", "comments"];
type Params = { id: string };

// GET /api/lineup/:id
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const populations = toArray(new URL(req.url).searchParams, "populations").filter((p) =>
    POPULATE.includes(p)
  );
  const lineup = await prisma.lineup.findUnique({
    where: { id },
    include: buildInclude(populations),
  });
  if (!lineup) throw notFound("Lineup");
  return ok(lineup);
});

// PATCH /api/lineup/:id
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { slots, ...rest } = await parseBody(req, lineupUpdate);

  const data: Prisma.LineupUncheckedUpdateInput = { ...rest };
  if (slots !== undefined) data.slots = { set: slots };

  return ok(await prisma.lineup.update({ where: { id }, data }));
});

// DELETE /api/lineup/:id
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  await prisma.lineup.delete({ where: { id } });
  return noContent();
});
