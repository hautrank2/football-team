import { currentQuarter } from "@/constants/schedule";
import { prisma } from "@/lib/prisma";
import { sanitizePlayer } from "@/lib/match";
import { route } from "@/lib/route";
import { ok } from "@/lib/response";
import type { LeaderboardRow } from "@/types";

// GET /api/leaderboard?metric=goals|assists&startAt&endAt&limit
// "Vua phá lưới" / "Vua kiến tạo". Defaults to the current quarter.
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const metric: "goals" | "assists" = sp.get("metric") === "assists" ? "assists" : "goals";

  const now = new Date();
  const quarter = currentQuarter(now);
  const startAt = sp.get("startAt") ? new Date(sp.get("startAt") as string) : quarter.start;
  const endAt = sp.get("endAt") ? new Date(sp.get("endAt") as string) : quarter.end;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 20, 1), 100);

  // Aggregate in JS (small dataset; avoids groupBy-over-relation quirks on Mongo).
  const parts = await prisma.matchPlayer.findMany({
    where: { match: { matchDate: { gte: startAt, lte: endAt } } },
    select: { playerId: true, goals: true, assists: true },
  });

  const agg = new Map<string, { goals: number; assists: number; matches: number }>();
  for (const p of parts) {
    const a = agg.get(p.playerId) ?? { goals: 0, assists: 0, matches: 0 };
    a.goals += p.goals;
    a.assists += p.assists;
    a.matches += 1;
    agg.set(p.playerId, a);
  }

  const top = [...agg.entries()].sort((a, b) => b[1][metric] - a[1][metric]).slice(0, limit);

  const players = await prisma.player.findMany({ where: { id: { in: top.map(([id]) => id) } } });
  const byId = new Map(players.map((p) => [p.id, p]));

  const rows: LeaderboardRow[] = top
    .map(([id, a]) => {
      const player = byId.get(id);
      if (!player) return null;
      return {
        player: sanitizePlayer(player),
        goals: a.goals,
        assists: a.assists,
        matchesPlayed: a.matches,
      };
    })
    .filter((r): r is LeaderboardRow => r !== null);

  return ok(rows);
});
