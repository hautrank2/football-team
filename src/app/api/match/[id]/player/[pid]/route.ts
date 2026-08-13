import { prisma } from "@/lib/prisma";
import { amountDueOf, costPerHeadOf, totalHeadsOf } from "@/lib/match";
import { notFound, route } from "@/lib/route";
import { noContent, ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { participantPayment } from "@/types";

type Params = { id: string; pid: string };

// PATCH /api/match/:id/player/:pid — admin marks a participant paid / unpaid.
// `pid` is the MatchPlayer id.
export const PATCH = route<Params>(async (req, { params }) => {
  const { pid } = await params;
  parseId(pid);
  const { isPaid } = await parseBody(req, participantPayment);
  return ok(await prisma.matchPlayer.update({ where: { id: pid }, data: { isPaid } }));
});

// DELETE /api/match/:id/player/:pid — admin removes a participant from the match.
// `pid` is the MatchPlayer id. Unlike a player's own unvote, this is an admin fix:
// it does NOT touch reputation and is NOT blocked by the kick-off lock. All of the
// player's match linkage (vote, MVP ballots, MVP title) is cleared so the list
// stays consistent.
export const DELETE = route<Params>(async (_req, { params }) => {
  const { id, pid } = await params;
  parseId(id);
  parseId(pid);

  const mp = await prisma.matchPlayer.findUnique({ where: { id: pid } });
  if (!mp || mp.matchId !== id) throw notFound("Participant");
  const { playerId } = mp;

  // Drop the day's vote + any MVP ballots cast by / targeting this player.
  await prisma.matchVote.deleteMany({ where: { matchId: id, playerId } });
  await prisma.matchMvpVote.deleteMany({
    where: { matchId: id, OR: [{ voterId: playerId }, { mvpPlayerId: playerId }] },
  });

  // If they were a match MVP, detach them from the title.
  const match = await prisma.match.findUnique({
    where: { id },
    select: { mvpPlayerIds: true, fieldCost: true },
  });
  if (match?.mvpPlayerIds.includes(playerId)) {
    await prisma.match.update({
      where: { id },
      data: { mvpPlayers: { disconnect: { id: playerId } } },
    });
  }

  await prisma.matchPlayer.delete({ where: { id: pid } });

  // If the field cost was already settled, re-split it across the REMAINING
  // participants (recompute totalHeads / costPerHead / amountDue) so the total
  // still covers the pitch. NOTE: this can raise everyone else's share.
  if (match?.fieldCost != null) {
    const remaining = await prisma.matchPlayer.findMany({
      where: { matchId: id },
      select: { id: true, guestCount: true },
    });
    const totalHeads = totalHeadsOf(remaining);
    const costPerHead = costPerHeadOf(match.fieldCost, totalHeads);
    await Promise.all(
      remaining.map((r) =>
        prisma.matchPlayer.update({
          where: { id: r.id },
          data: { amountDue: amountDueOf(costPerHead, r.guestCount) },
        })
      )
    );
    await prisma.match.update({ where: { id }, data: { totalHeads, costPerHead } });
  }

  return noContent();
});
