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

  // A non-empty stored mvpPlayerIds means the award has already been finalized.
  // Until then we still tally the ballots and return the current leader(s), so
  // the page can show a live MVP — but we only PERSIST once the window has
  // closed, so an early lead can never lock the award in.
  let mvpFinalized = match.mvpPlayerIds.length > 0;
  if (!mvpFinalized) {
    const votes = await prisma.matchMvpVote.findMany({
      where: { matchId: id },
      select: { mvpPlayerId: true },
    });
    const leaders = tallyMvp(votes);
    if (leaders.length) {
      match.mvpPlayerIds = leaders;
      match.mvpPlayers = await prisma.player.findMany({ where: { id: { in: leaders } } });
      if (isReportWindowClosed(match.kickoffAt, new Date())) {
        await prisma.match.update({ where: { id }, data: { mvpPlayerIds: leaders } });
        mvpFinalized = true;
      }
    }
  }

  return ok({
    ...match,
    mvpFinalized,
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
