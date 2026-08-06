"use client";

import { useMemo } from "react";
import { usePlayers, useTeams } from "@/hooks";
import { useAuth } from "@/contexts";
import type { PlayerModel } from "@/types";

// Landing page pulls the whole squad in one shot (a club roster is small), then
// sorts by overall rating so the wall leads with the highest-rated players.
const SQUAD_SIZE = 60;

export const useHomePage = () => {
  const { isAdmin } = useAuth();

  const query = usePlayers({
    page: 1,
    pageSize: SQUAD_SIZE,
    populations: ["team", "positions", "attribute"],
    sortBy: "jerseyNumber",
    order: "asc",
  });

  // Sort the whole squad by overall rating (desc); this order flows into the
  // team grouping below, so each team row reads best-to-worst.
  const players = useMemo(() => {
    const items = query.data?.items ?? [];
    return [...items].sort((a, b) => (b.attribute?.overall ?? 0) - (a.attribute?.overall ?? 0));
  }, [query.data]);

  const teamCount = useMemo(
    () => new Set(players.map((p) => p.team?.id).filter(Boolean)).size,
    [players]
  );

  // Full team roster (includes teams with no players yet), each annotated with a
  // live player count derived from the loaded squad.
  const teamsQuery = useTeams({ page: 1, pageSize: 100, sortBy: "name", order: "asc" });
  const teamList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of players) {
      if (p.team?.id) counts.set(p.team.id, (counts.get(p.team.id) ?? 0) + 1);
    }
    return (teamsQuery.data?.items ?? []).map((t) => ({
      ...t,
      playerCount: counts.get(t.id) ?? 0,
    }));
  }, [teamsQuery.data, players]);

  // Group the squad into one row per team. Players sharing no team fall into a
  // trailing "no team" bucket. Order preserves first appearance (players already
  // arrive sorted by jersey number, so each row stays in team-sheet order).
  const teams = useMemo(() => {
    const NO_TEAM = "__none__";
    const map = new Map<
      string,
      { id: string; name: string; shortName: string | null; players: PlayerModel[] }
    >();

    for (const p of players) {
      const id = p.team?.id ?? NO_TEAM;
      let row = map.get(id);
      if (!row) {
        row = {
          id,
          name: p.team?.name ?? "Chưa có đội",
          shortName: p.team?.shortName ?? null,
          players: [],
        };
        map.set(id, row);
      }
      row.players.push(p);
    }

    // Keep the "no team" bucket last regardless of insertion order.
    return Array.from(map.values()).sort((a, b) => {
      if (a.id === NO_TEAM) return 1;
      if (b.id === NO_TEAM) return -1;
      return 0;
    });
  }, [players]);

  return {
    players,
    teams,
    teamList,
    isLoadingTeams: teamsQuery.isPending,
    isLoading: query.isPending,
    total: query.data?.total ?? players.length,
    teamCount,
    canEdit: isAdmin,
  };
};
