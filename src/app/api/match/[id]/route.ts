import { isReportWindowClosed } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { sanitizePlayer, tallyMvp } from "@/lib/match";
import { notFound, route } from "@/lib/route";
import { ok } from "@/lib/response";
import { parseBody, parseId } from "@/lib/validation";
import { matchUpdate } from "@/types";

type Params = { id: string };

// GET /api/match/:id — detail with participant list + MVP.
// Lazily finalizes the MVP once the report window has closed (most-voted; ties
// keep everyone; needs > 0 votes).
export const GET = route<Params>(async (_req, { params }) => {
  const { id } = await params;
  parseId(id);

  const match = await prisma.match.findUnique({
    where: { id },
    include: { players: { include: { player: true } }, mvpPlayers: true },
  });
  if (!match) throw notFound("Match");

  if (match.mvpPlayerIds.length === 0 && isReportWindowClosed(match.kickoffAt, new Date())) {
    const votes = await prisma.matchMvpVote.findMany({
      where: { matchId: id },
      select: { mvpPlayerId: true },
    });
    const winners = tallyMvp(votes);
    if (winners.length) {
      await prisma.match.update({ where: { id }, data: { mvpPlayerIds: winners } });
      match.mvpPlayerIds = winners;
      match.mvpPlayers = await prisma.player.findMany({ where: { id: { in: winners } } });
    }
  }

  return ok({
    ...match,
    players: match.players.map((mp) => ({ ...mp, player: sanitizePlayer(mp.player) })),
    mvpPlayers: match.mvpPlayers.map(sanitizePlayer),
  });
});

// PATCH /api/match/:id — admin edits kick-off / location / note / status.
export const PATCH = route<Params>(async (req, { params }) => {
  const { id } = await params;
  parseId(id);
  const data = await parseBody(req, matchUpdate);
  return ok(await prisma.match.update({ where: { id }, data }));
});
