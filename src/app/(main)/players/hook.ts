"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { usePlayers, useTeams } from "@/hooks";
import { positionCategory } from "@/lib/player-meta";
import type { PlayerModel } from "@/types";

export type TeamGroup = {
  id: string;
  name: string;
  createdAt: string | null;
  players: PlayerModel[];
};

const NO_TEAM = "__none__";

// Group players by team, ordered by the team's createdAt (earliest first); the
// "no team" bucket always trails.
const groupByTeam = (players: PlayerModel[]): TeamGroup[] => {
  const map = new Map<string, TeamGroup>();
  for (const p of players) {
    const id = p.team?.id ?? NO_TEAM;
    let row = map.get(id);
    if (!row) {
      row = {
        id,
        name: p.team?.name ?? "Chưa có đội",
        createdAt: (p.team?.createdAt as string | undefined) ?? null,
        players: [],
      };
      map.set(id, row);
    }
    row.players.push(p);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.id === NO_TEAM) return 1;
    if (b.id === NO_TEAM) return -1;
    return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
  });
};

// Players directory. The API already returns every player, so ALL filters (name,
// nickname, team, position line) run purely on the client. Filters live in the URL
// search params (shareable + back-button friendly).
export const usePlayersPage = () => {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const name = sp.get("name") ?? "";
  const nickname = sp.get("nickname") ?? "";
  const teamId = sp.get("team") ?? "";
  const position = sp.get("position") ?? ""; // GK | DF | MD | FW

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const reset = () => router.replace(pathname, { scroll: false });

  // Fetch everything once — no server-side filtering.
  const query = usePlayers({
    page: 1,
    pageSize: 200,
    populations: ["team", "attribute"],
    sortBy: "jerseyNumber",
    order: "asc",
  });

  // Highest-rated first within each team row.
  const allPlayers = useMemo(
    () =>
      [...(query.data?.items ?? [])].sort(
        (a, b) => (b.attribute?.overall ?? 0) - (a.attribute?.overall ?? 0),
      ),
    [query.data],
  );

  const players = useMemo(() => {
    const nameQ = name.trim().toLowerCase();
    const nickQ = nickname.trim().toLowerCase();
    return allPlayers.filter((p) => {
      if (nameQ && !p.fullName.toLowerCase().includes(nameQ)) return false;
      if (nickQ && !(p.nickname ?? "").toLowerCase().includes(nickQ)) return false;
      if (teamId && p.team?.id !== teamId) return false;
      if (position && !(p.positions ?? []).some((pos) => positionCategory(pos) === position))
        return false;
      return true;
    });
  }, [allPlayers, name, nickname, teamId, position]);

  const grouped = useMemo(() => groupByTeam(players), [players]);

  const teamsQuery = useTeams({ pageSize: 100 });

  return {
    filters: { name, nickname, teamId, position },
    setFilter,
    reset,
    hasFilters: !!(name || nickname || teamId || position),
    players,
    grouped,
    teams: teamsQuery.data?.items ?? [],
    total: players.length,
    isLoading: query.isPending,
  };
};
