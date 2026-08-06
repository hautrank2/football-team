"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { usePlayers, useTeams } from "@/hooks";
import type { PlayerModel } from "@/types";

export type TeamGroup = {
  id: string;
  name: string;
  players: PlayerModel[];
};

const NO_TEAM = "__none__";

const groupByTeam = (players: PlayerModel[]): TeamGroup[] => {
  const map = new Map<string, TeamGroup>();
  for (const p of players) {
    const id = p.team?.id ?? NO_TEAM;
    let row = map.get(id);
    if (!row) {
      row = { id, name: p.team?.name ?? "Chưa có đội", players: [] };
      map.set(id, row);
    }
    row.players.push(p);
  }
  // Keep the "no team" bucket last.
  return Array.from(map.values()).sort((a, b) => {
    if (a.id === NO_TEAM) return 1;
    if (b.id === NO_TEAM) return -1;
    return 0;
  });
};

// Players directory with team/title/position/name filters. Filters live in the URL
// search params (shareable + back-button friendly). Filter keys map to the player
// list API: name→fullName, team→teamId, title→title, position→positions.
export const usePlayersPage = () => {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const name = sp.get("name") ?? "";
  const teamId = sp.get("team") ?? "";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const reset = () => router.replace(pathname, { scroll: false });

  const query = usePlayers({
    page: 1,
    pageSize: 200,
    populations: ["team", "attribute"],
    sortBy: "jerseyNumber",
    order: "asc",
    fullName: name || undefined,
    teamId: teamId || undefined,
  });

  // Highest-rated first within each team row.
  const players = useMemo(
    () =>
      [...(query.data?.items ?? [])].sort(
        (a, b) => (b.attribute?.overall ?? 0) - (a.attribute?.overall ?? 0)
      ),
    [query.data]
  );

  const grouped = useMemo(() => groupByTeam(players), [players]);

  const teamsQuery = useTeams({ pageSize: 100, sortBy: "name", order: "asc" });

  return {
    filters: { name, teamId },
    setFilter,
    reset,
    hasFilters: !!(name || teamId),
    players,
    grouped,
    teams: teamsQuery.data?.items ?? [],
    total: query.data?.total ?? players.length,
    isLoading: query.isPending,
  };
};
