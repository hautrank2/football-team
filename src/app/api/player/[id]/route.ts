import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound, route } from "@/server/http";
import { buildInclude, toArray } from "@/server/query";
import { noContent, ok } from "@/server/response";
import { parseBody, parseId } from "@/server/validation";
import { playerUpdate } from "@/server/schemas";

const POPULATE = ["team", "positions", "attribute", "quotesReceived", "quotesWritten", "lineups"];
type Params = { id: string };

// GET /api/player/:id
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const populations = toArray(new URL(req.url).searchParams, "populations").filter((p) =>
    POPULATE.includes(p)
  );
  const player = await prisma.player.findUnique({
    where: { id },
    include: buildInclude(populations),
    omit: { passwordHash: true },
  });
  if (!player) throw notFound("Player");
  return ok(player);
});

// PATCH /api/player/:id
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { password, positionIds, teamId, ...rest } = await parseBody(req, playerUpdate);

  const data: Prisma.PlayerUpdateInput = { ...rest };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  if (teamId !== undefined) data.team = teamId ? { connect: { id: teamId } } : { disconnect: true };
  if (positionIds !== undefined) data.positions = { set: positionIds.map((pid) => ({ id: pid })) };

  const player = await prisma.player.update({ where: { id }, data, omit: { passwordHash: true } });
  return ok(player);
});

// DELETE /api/player/:id
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);
  await prisma.player.delete({ where: { id } });
  return noContent();
});
