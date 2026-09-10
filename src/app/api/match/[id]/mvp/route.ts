import { isReportWindowOpen, SCHEDULE } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { exact } from "@/lib/query";
import { badRequest, notFound, route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { mvpVoteCreate } from "@/types";

type Params = { id: string };

// GET /api/match/:id/mvp?voterId=... — the ballot this voter already cast for
// the match, or null. Only the caller's own vote is exposed: the tally stays
// secret until it is finalized (see GET /api/match/:id).
export const GET = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const voterId = exact(new URL(req.url).searchParams, "voterId");
  if (!voterId) throw badRequest("Thiếu voterId.");
  parseId(voterId);

  const vote = await prisma.matchMvpVote.findUnique({
    where: { matchId_voterId: { matchId: id, voterId } },
  });
  return ok(vote);
});

// POST /api/match/:id/mvp — a participant votes one participant as MVP.
// Report window only; one ballot per voter (upsert).
export const POST = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { voterId, mvpPlayerId } = await parseBody(req, mvpVoteCreate);

  const match = await prisma.match.findUnique({ where: { id }, select: { kickoffAt: true } });
  if (!match) throw notFound("Match");
  if (!isReportWindowOpen(match.kickoffAt, new Date()))
    throw badRequest(
      `Đã hết hạn bầu MVP (chỉ trong ${SCHEDULE.REPORT_WINDOW_HOURS / 24} ngày sau trận).`,
    );

  const [voter, target] = await Promise.all([
    prisma.matchPlayer.findUnique({
      where: { matchId_playerId: { matchId: id, playerId: voterId } },
      select: { id: true },
    }),
    prisma.matchPlayer.findUnique({
      where: { matchId_playerId: { matchId: id, playerId: mvpPlayerId } },
      select: { id: true },
    }),
  ]);
  if (!voter) throw badRequest("Chỉ người tham gia mới được bầu MVP.");
  if (!target) throw badRequest("MVP phải là người trong danh sách tham gia.");

  const vote = await prisma.matchMvpVote.upsert({
    where: { matchId_voterId: { matchId: id, voterId } },
    create: { matchId: id, voterId, mvpPlayerId },
    update: { mvpPlayerId },
  });
  return ok(vote);
});
