import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, notFound, route } from "@/lib/route";
import { buildInclude, toArray } from "@/lib/query";
import { noContent, ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { playerUpdate } from "@/types";

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
  // Admin accounts are internal — never surfaced through the player API.
  if (!player || player.role === "ADMIN") throw notFound("Player");
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

// DELETE /api/player/:id — admin accounts are protected and cannot be removed.
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);

  const target = await prisma.player.findUnique({ where: { id }, select: { role: true } });
  if (!target) throw notFound("Player");
  if (target.role === "ADMIN") throw new ApiError(403, "Không thể xóa tài khoản admin");

  await prisma.player.delete({ where: { id } });
  return noContent();
});
