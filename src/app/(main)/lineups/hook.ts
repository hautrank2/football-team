"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts";
import { useLineups } from "@/hooks";

// Public browse page — no auth guard. Lists every PUBLIC lineup so guests can
// look around; signed-in users additionally get management shortcuts.
export const useLineupsPage = () => {
  const { user } = useAuth();

  const query = useLineups({
    isPublic: true,
    pageSize: 100,
    sortBy: "updatedAt",
    order: "desc",
    populations: ["owner"],
  });

  const lineups = useMemo(() => query.data?.items ?? [], [query.data]);

  return {
    user,
    lineups,
    isLoading: query.isPending,
  };
};
