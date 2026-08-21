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
// day's votes into the participant list. Either the day already has votes, or
// the admin quick-creates by passing `players` (vote step skipped).
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

  // Quick-create picks — deduped by player (last guest count wins). Validated
  // in memory (not via `isDeleted: { not: true }`) so players whose document
  // predates the field aren't silently dropped.
  const picked = [
    ...new Map(
      (data.players ?? []).map((p) => [p.playerId, p] as const),
    ).values(),
  ];
  if (picked.length > 0) {
    const rows = await prisma.player.findMany({
      where: { id: { in: picked.map((p) => p.playerId) } },
      select: { id: true, isDeleted: true },
    });
    const valid = new Set(rows.filter((p) => !p.isDeleted).map((p) => p.id));
    if (valid.size !== picked.length)
      throw badRequest("Danh sách có cầu thủ không hợp lệ.");
  }

  // Gather that day's votes not yet tied to a match, from non-deleted players.
  const votes = await prisma.matchVote.findMany({
    where: {
      voteDate: { gte: matchDate, lte: vnDayEnd(matchDate) },
      matchId: null,
      player: { isDeleted: { not: true } },
    },
    select: { id: true },
  });
  if (votes.length === 0 && picked.length === 0)
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

  // Mirror the picked players as votes for that day (same as adding a
  // participant by hand), so votes and participants stay in sync. A player who
  // both voted and was picked keeps a single vote row (unique playerId+voteDate).
  for (const p of picked) {
    await prisma.matchVote.upsert({
      where: { playerId_voteDate: { playerId: p.playerId, voteDate: matchDate } },
      create: {
        playerId: p.playerId,
        voteDate: matchDate,
        guestCount: p.guestCount,
        matchId: match.id,
      },
      update: { guestCount: p.guestCount, matchId: match.id },
    });
  }
  // Tag the day's remaining votes with the match…
  await prisma.matchVote.updateMany({
    where: { id: { in: votes.map((v) => v.id) } },
    data: { matchId: match.id },
  });
  // …then mirror every vote of this match into the participant list.
  const joined = await prisma.matchVote.findMany({
    where: { matchId: match.id },
    select: { playerId: true, guestCount: true },
  });
  await prisma.matchPlayer.createMany({
    data: joined.map((v) => ({
      matchId: match.id,
      playerId: v.playerId,
      guestCount: v.guestCount,
    })),
  });

  const full = await prisma.match.findUnique({
    where: { id: match.id },
    include: { players: { include: { player: true } } },
  });
  return created(full);
});
