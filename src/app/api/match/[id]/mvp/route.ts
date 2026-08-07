import { isReportWindowOpen } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { mvpVoteCreate } from "@/types";

type Params = { id: string };

// POST /api/match/:id/mvp — a participant votes one participant as MVP.
// Report window only; one ballot per voter (upsert).
export const POST = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { voterId, mvpPlayerId } = await parseBody(req, mvpVoteCreate);

  const match = await prisma.match.findUnique({ where: { id }, select: { kickoffAt: true } });
  if (!match) throw notFound("Match");
  if (!isReportWindowOpen(match.kickoffAt, new Date()))
    throw badRequest("Đã hết hạn bầu MVP (chỉ trong 24h sau trận).");

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
