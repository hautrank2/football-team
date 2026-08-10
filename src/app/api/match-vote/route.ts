import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { badRequest, route } from "@/lib/route";
import { buildInclude, dateRange, exact, parseListQuery } from "@/lib/query";
import { ok, tableResponse } from "@/lib/response";
import { parseBody } from "@/lib/validation";
import { isVotableDate, vnDay, vnDayEnd } from "@/constants/schedule";
import { matchVoteUpsert } from "@/types";

const SORT = ["createdAt", "voteDate"];
const POPULATE = ["player", "match"];

// GET /api/match-vote — list votes (filter playerId, matchId, voteDate range).
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = parseListQuery(sp, { sortWhitelist: SORT, populationWhitelist: POPULATE });

  const where: Prisma.MatchVoteWhereInput = {};
  const playerId = exact(sp, "playerId");
  const matchId = exact(sp, "matchId");
  const voteDate = dateRange(sp, "voteDate");
  if (playerId) where.playerId = playerId;
  if (matchId) where.matchId = matchId;
  if (voteDate) where.voteDate = voteDate;

  const [items, total] = await Promise.all([
    prisma.matchVote.findMany({
      where,
      orderBy: { [q.sortBy]: q.order },
      skip: q.skip,
      take: q.pageSize,
      include: buildInclude(q.populations),
    }),
    prisma.matchVote.count({ where }),
  ]);

  return ok(tableResponse(items, total, q.page, q.pageSize));
});

// POST /api/match-vote — upsert a vote for a day (one per player+day).
// If the day is already a confirmed match (and not yet locked), the voter is
// mirrored into the participant list too.
export const POST = route(async (req) => {
  const { playerId, voteDate: rawDate, guestCount, note } = await parseBody(req, matchVoteUpsert);
  const now = new Date();
  // Anchor to the VN calendar day (UTC midnight) — tz-independent, no host clock.
  const voteDate = vnDay(rawDate);

  if (!isVotableDate(voteDate, now))
    throw badRequest("Ngày này không thể vote (ngoài tuần cho phép hoặc đã tới giờ khóa).");

  // A match already confirmed for this day? (day-range, tz-agnostic equality)
  const match = await prisma.match.findFirst({
    where: { matchDate: { gte: voteDate, lte: vnDayEnd(voteDate) } },
    select: { id: true },
  });

  const vote = await prisma.matchVote.upsert({
    where: { playerId_voteDate: { playerId, voteDate } },
    create: { playerId, voteDate, guestCount, note, matchId: match?.id ?? null },
    update: { guestCount, note, matchId: match?.id ?? null },
  });

  // Keep the participant list in sync when the match already exists.
  if (match) {
    await prisma.matchPlayer.upsert({
      where: { matchId_playerId: { matchId: match.id, playerId } },
      create: { matchId: match.id, playerId, guestCount },
      update: { guestCount },
    });
  }

  return ok(vote);
});
