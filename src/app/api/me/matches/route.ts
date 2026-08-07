import { prisma } from "@/lib/prisma";
import { badRequest, route } from "@/lib/route";
import { exact } from "@/lib/query";
import { ok } from "@/lib/response";
import type { MyMatchRow, MyMatchesSummary } from "@/types";

// GET /api/me/matches?playerId=... — "Trận đấu của tôi": matches the player
// joined, with goals/assists, amount owed, and totals for the header dropdown.
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const playerId = exact(sp, "playerId");
  if (!playerId) throw badRequest("Thiếu playerId.");

  const parts = await prisma.matchPlayer.findMany({
    where: { playerId },
    include: { match: true },
  });

  const matches: MyMatchRow[] = parts
    .map((p) => ({
      match: p.match,
      goals: p.goals,
      assists: p.assists,
      amountDue: p.amountDue,
      isPaid: p.isPaid,
    }))
    // Newest match first (sorted in JS to avoid orderBy-over-relation on Mongo).
    .sort((a, b) => new Date(b.match.matchDate).getTime() - new Date(a.match.matchDate).getTime());

  const summary: MyMatchesSummary = {
    matches,
    totalDebt: matches.reduce((s, m) => s + (m.isPaid ? 0 : m.amountDue), 0),
    totalGoals: matches.reduce((s, m) => s + m.goals, 0),
    totalAssists: matches.reduce((s, m) => s + m.assists, 0),
  };

  return ok(summary);
});
