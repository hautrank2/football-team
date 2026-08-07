import { prisma } from "@/lib/prisma";
import { amountDueOf, costPerHeadOf, totalHeadsOf } from "@/lib/match";
import { badRequest, notFound, route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { matchSettleCost } from "@/types";

type Params = { id: string };

// POST /api/match/:id/settle-cost — admin enters the field cost (any time after
// the match). Recomputes totalHeads / costPerHead (ceil) and every participant's
// amountDue from the locked participant list.
export const POST = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { fieldCost } = await parseBody(req, matchSettleCost);

  const match = await prisma.match.findUnique({
    where: { id },
    include: { players: true },
  });
  if (!match) throw notFound("Match");
  if (match.players.length === 0)
    throw badRequest("Trận chưa có người tham gia, không thể chia tiền.");

  const totalHeads = totalHeadsOf(match.players);
  const costPerHead = costPerHeadOf(fieldCost, totalHeads);

  await Promise.all(
    match.players.map((p) =>
      prisma.matchPlayer.update({
        where: { id: p.id },
        data: { amountDue: amountDueOf(costPerHead, p.guestCount) },
      })
    )
  );

  const updated = await prisma.match.update({
    where: { id },
    data: { fieldCost, totalHeads, costPerHead },
    include: { players: true },
  });
  return ok(updated);
});
