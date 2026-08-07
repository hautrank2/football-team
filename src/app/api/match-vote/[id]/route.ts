import { kickoffFor } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, route } from "@/lib/route";
import { noContent } from "@/lib/response";
import { parseId } from "@/lib/validation";

type Params = { id: string };

// DELETE /api/match-vote/:id — unvote.
// If the day is already a confirmed match, unvoting also removes the player from
// the participant list AND deducts 1 reputation point. Locked once kick-off hits.
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);

  const vote = await prisma.matchVote.findUnique({ where: { id } });
  if (!vote) throw notFound("Vote");

  if (new Date() >= kickoffFor(vote.voteDate))
    throw badRequest("Đã tới giờ khóa — không thể hủy vote.");

  if (vote.matchId) {
    await prisma.matchPlayer.deleteMany({
      where: { matchId: vote.matchId, playerId: vote.playerId },
    });
    await prisma.player.update({
      where: { id: vote.playerId },
      data: { reputation: { decrement: 1 } },
    });
  }

  await prisma.matchVote.delete({ where: { id } });
  return noContent();
});
