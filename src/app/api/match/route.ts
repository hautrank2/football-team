import { MatchStatus, type Prisma } from "@prisma/client";
import { kickoffFor, vnDay, vnDayEnd } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { badRequest, route } from "@/lib/route";
import { buildInclude, dateRange, enumFilter, exact, parseListQuery } from "@/lib/query";
import { created, ok, tableResponse } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { matchCreate } from "@/types";

const SORT = ["createdAt", "matchDate", "kickoffAt"];
const POPULATE = ["players", "votes", "mvpVotes", "mvpPlayers"];

// GET /api/match — list matches (filter status, playerId, matchDate range).
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, {
    sortWhitelist: SORT,
    populationWhitelist: POPULATE,
    defaultSort: "matchDate",
  });

  const where: Prisma.MatchWhereInput = {};
  const status = enumFilter(sp, "status", MatchStatus);
  const playerId = exact(sp, "playerId");
  const matchDate = dateRange(sp, "matchDate");
  if (status) where.status = status;
  if (playerId) where.players = { some: { playerId } };
  if (matchDate) where.matchDate = matchDate;

  const [items, total] = await Promise.all([
    prisma.match.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.match.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/match — admin confirms a day → creates a match and mirrors that
// day's votes into the participant list. Requires at least one vote.
export const POST = route(async (req) => {
  const data = await parseBody(req, matchCreate);
  // Anchor to the VN calendar day (UTC midnight) — tz-independent, no host clock.
  const matchDate = vnDay(data.matchDate);
  const kickoffAt = data.kickoffAt ?? kickoffFor(matchDate);

  // One match per day.
  const existing = await prisma.match.findFirst({
    where: { matchDate: { gte: matchDate, lte: vnDayEnd(matchDate) } },
    select: { id: true },
  });
  if (existing) throw badRequest("Ngày này đã có trận đấu.");

  // Gather that day's votes not yet tied to a match, from non-deleted players.
  const votes = await prisma.matchVote.findMany({
    where: {
      voteDate: { gte: matchDate, lte: vnDayEnd(matchDate) },
      matchId: null,
      player: { isDeleted: { not: true } },
    },
  });
  if (votes.length === 0)
    throw badRequest("Ngày này chưa có ai vote, không thể tạo trận.");

  const match = await prisma.match.create({
    data: {
      matchDate,
      kickoffAt,
      location: data.location,
      note: data.note,
      status: MatchStatus.SCHEDULED,
    },
  });

  // Mirror votes → participant list, then tag the votes with the match.
  await prisma.matchPlayer.createMany({
    data: votes.map((v) => ({
      matchId: match.id,
      playerId: v.playerId,
      guestCount: v.guestCount,
    })),
  });
  await prisma.matchVote.updateMany({
    where: { id: { in: votes.map((v) => v.id) } },
    data: { matchId: match.id },
  });

  const full = await prisma.match.findUnique({
    where: { id: match.id },
    include: { players: { include: { player: true } } },
  });
  return created(full);
});
