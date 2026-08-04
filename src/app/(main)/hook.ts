"use client";

import { useMemo } from "react";
import { usePlayers } from "@/hooks";
import { useAuth } from "@/contexts";

// Landing page pulls the whole squad in one shot (a club roster is small), then
// sorts by jersey number so the wall reads like a real team sheet.
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

  const players = useMemo(() => query.data?.items ?? [], [query.data]);

  const topRating = useMemo(
    () => players.reduce((max, p) => Math.max(max, p.attribute?.overall ?? 0), 0),
    [players]
  );

  const teamCount = useMemo(
    () => new Set(players.map((p) => p.team?.id).filter(Boolean)).size,
    [players]
  );

  return {
    players,
    isLoading: query.isPending,
    total: query.data?.total ?? players.length,
    topRating,
    teamCount,
    canEdit: isAdmin,
  };
};
