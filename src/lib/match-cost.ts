import { prisma } from "@/lib/prisma";
import { amountDueOf, costPerHeadOf, totalHeadsOf } from "@/lib/match";

// Re-split a match's already-settled field cost across its CURRENT participants:
// recompute totalHeads / costPerHead (ceil) and every participant's amountDue.
// No-op when the cost hasn't been entered yet (fieldCost == null). Called after
// the participant list changes (add / remove) so the total keeps covering the
// pitch. NOTE: this can raise or lower everyone's share.
export const resplitMatchCost = async (
  matchId: string,
  fieldCost: number | null
): Promise<void> => {
  if (fieldCost == null) return;
  const players = await prisma.matchPlayer.findMany({
    where: { matchId },
    select: { id: true, guestCount: true },
  });
  const totalHeads = totalHeadsOf(players);
  const costPerHead = costPerHeadOf(fieldCost, totalHeads);
  await Promise.all(
    players.map((p) =>
      prisma.matchPlayer.update({
        where: { id: p.id },
        data: { amountDue: amountDueOf(costPerHead, p.guestCount) },
      })
    )
  );
  await prisma.match.update({ where: { id: matchId }, data: { totalHeads, costPerHead } });
};
