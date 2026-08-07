import { isReportWindowOpen } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { reportStats } from "@/types";

type Params = { id: string };

// POST /api/match/:id/stats — a participant self-reports their goals + assists.
// Allowed only during the report window (24h from kick-off) and only for someone
// on the participant list.
export const POST = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { playerId, goals, assists } = await parseBody(req, reportStats);

  const match = await prisma.match.findUnique({ where: { id }, select: { kickoffAt: true } });
  if (!match) throw notFound("Match");
  if (!isReportWindowOpen(match.kickoffAt, new Date()))
    throw badRequest("Đã hết hạn nhập (chỉ trong 24h sau trận).");

  const participant = await prisma.matchPlayer.findUnique({
    where: { matchId_playerId: { matchId: id, playerId } },
    select: { id: true },
  });
  if (!participant) throw badRequest("Bạn không có trong danh sách tham gia trận này.");

  const updated = await prisma.matchPlayer.update({
    where: { id: participant.id },
    data: { goals, assists },
  });
  return ok(updated);
});
