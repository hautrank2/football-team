"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/contexts";
import { useLineup, usePlayers } from "@/hooks";
import type { PlayerModel } from "@/types";

export const useLineupViewPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();

  const query = useLineup(id, ["owner"]);
  const lineup = query.data;

  // Tokens need player details (avatar/name/number) resolved by id.
  const playersQuery = usePlayers({ page: 1, pageSize: 200 });
  const playersById = useMemo(() => {
    const map = new Map<string, PlayerModel>();
    (playersQuery.data?.items ?? []).forEach((p) => map.set(p.id, p));
    return map;
  }, [playersQuery.data]);

  const isOwner = !!user && !!lineup && lineup.ownerId === user.id;
  // Private lineups are only visible to their owner.
  const canView = !!lineup && (lineup.isPublic || isOwner);

  return {
    lineup,
    playersById,
    isOwner,
    canView,
    isLoading: query.isPending || playersQuery.isPending,
    isError: query.isError,
  };
};
