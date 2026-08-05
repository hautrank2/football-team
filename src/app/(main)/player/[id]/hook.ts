"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/contexts";
import { usePlayer } from "@/hooks";

// Public player detail — anyone (guest or logged-in) may view it. The full
// profile is pulled in one request: team, positions, FIFA-style attributes and
// the quotes teammates have written about this player.
const DETAIL_POPULATIONS = ["team", "positions", "attribute", "quotesReceived"];

export const usePlayerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();

  const query = usePlayer(id, DETAIL_POPULATIONS);
  const player = query.data;

  return {
    player,
    isLoading: query.isPending,
    isError: query.isError,
    // Admins can edit anyone; a player can edit their own page.
    canEdit: isAdmin || (!!player && user?.id === player.id),
  };
};
