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
  // All player docs carry isDeleted (default false), so exclude only true.
  const where: Prisma.PlayerWhereInput = {
    role: { not: Role.ADMIN },
    isDeleted: { not: true },
  };
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

// Baseline ratings for a brand-new player (all required attribute fields).
// GK fields stay optional/undefined. Overwritten later via the attribute upsert.
const DEFAULT_ATTRIBUTE = {
  overall: 50,
  skillMoves: 1,
  acceleration: 50,
  sprintSpeed: 50,
  attPositioning: 50,
  finishing: 50,
  shotPower: 50,
  longShots: 50,
  volleys: 50,
  penalties: 50,
  vision: 50,
  crossing: 50,
  freeKick: 50,
  shortPassing: 50,
  longPassing: 50,
  curve: 50,
  agility: 50,
  balance: 50,
  reactions: 50,
  ballControl: 50,
  dribbling: 50,
  composure: 50,
  interceptions: 50,
  heading: 50,
  defAwareness: 50,
  standingTackle: 50,
  slidingTackle: 50,
  jumping: 50,
  stamina: 50,
  strength: 50,
  aggression: 50,
} as const;

// POST /api/player — create (registers an account + its attribute record)
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
      // Every player gets an attribute record from the start.
      attribute: { create: { ...DEFAULT_ATTRIBUTE } },
      ...(teamId ? { team: { connect: { id: teamId } } } : {}),
      ...(positionIds.length
        ? { positions: { connect: positionIds.map((id) => ({ id })) } }
        : {}),
    },
    omit: { passwordHash: true },
  });

  return created(player);
});
