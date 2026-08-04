import bcrypt from "bcryptjs";
import { MaritalStatus, PlayerTitle, Role, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/route";
import {
  buildInclude,
  dateRange,
  enumFilter,
  exact,
  idsFilter,
  parseListQuery,
  textFilter,
} from "@/lib/query";
import { created, ok, tableResponse } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { playerCreate } from "@/types";

const SORT = ["createdAt", "updatedAt", "fullName", "jerseyNumber", "birthday"];
const POPULATE = ["team", "positions", "attribute"];

// GET /api/player — list
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, {
    sortWhitelist: SORT,
    populationWhitelist: POPULATE,
  });

  // Admin accounts are internal — never surfaced through the player API.
  const where: Prisma.PlayerWhereInput = { role: { not: Role.ADMIN } };
  const fullName = textFilter(sp, "fullName");
  const nickname = textFilter(sp, "nickname");
  const username = textFilter(sp, "username");
  const title = enumFilter(sp, "title", PlayerTitle);
  const marital = enumFilter(sp, "maritalStatus", MaritalStatus);
  const teamId = exact(sp, "teamId");
  const positionIds = idsFilter(sp, "positionIds");
  const birthday = dateRange(sp, "birthday");
  const createdAt = dateRange(sp, "created");

  if (fullName) where.fullName = fullName;
  if (nickname) where.nickname = nickname;
  if (username) where.username = username;
  if (title) where.title = title;
  if (marital) where.maritalStatus = marital;
  if (teamId) where.teamId = teamId;
  if (positionIds) where.positionIds = positionIds;
  if (birthday) where.birthday = birthday;
  if (createdAt) where.createdAt = createdAt;

  const [items, total] = await Promise.all([
    prisma.player.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
      omit: { passwordHash: true },
    }),
    prisma.player.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/player — create (registers an account)
export const POST = route(async (req) => {
  const { password, positionIds, teamId, ...rest } = await parseBody(
    req,
    playerCreate,
  );
  const passwordHash = await bcrypt.hash(password, 10);

  const player = await prisma.player.create({
    data: {
      ...rest,
      passwordHash,
      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
      ...(positionIds.length
        ? { positions: { connect: positionIds.map((id) => ({ id })) } }
        : {}),
    },
    omit: { passwordHash: true },
  });

  return created(player);
});
