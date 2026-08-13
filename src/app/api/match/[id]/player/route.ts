import { prisma } from "@/lib/prisma";
import { resplitMatchCost } from "@/lib/match-cost";
import { badRequest, notFound, route } from "@/lib/route";
import { created } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { participantAdd } from "@/types";

type Params = { id: string };

// POST /api/match/:id/player — admin adds a player to the participant list with a
// guest count. Mirrors the vote for that day (tagged with the match) so votes +
// participants stay in sync, then re-splits the cost if it was already settled.
export const POST = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const { playerId, guestCount } = await parseBody(req, participantAdd);

  const match = await prisma.match.findUnique({
    where: { id },
    select: { id: true, matchDate: true, fieldCost: true },
  });
  if (!match) throw notFound("Match");

  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { id: true, isDeleted: true },
  });
  if (!player || player.isDeleted) throw notFound("Player");

  const already = await prisma.matchPlayer.findUnique({
    where: { matchId_playerId: { matchId: id, playerId } },
  });
  if (already) throw badRequest("Cầu thủ đã có trong danh sách.");

  // Mirror the day's vote (tagged with the match) + add to the participant list.
  await prisma.matchVote.upsert({
    where: { playerId_voteDate: { playerId, voteDate: match.matchDate } },
    create: { playerId, voteDate: match.matchDate, guestCount, matchId: id },
    update: { guestCount, matchId: id },
  });
  const participant = await prisma.matchPlayer.create({
    data: { matchId: id, playerId, guestCount },
  });

  // Keep the money split consistent when the cost was already entered.
  await resplitMatchCost(id, match.fieldCost);

  return created(participant);
});
