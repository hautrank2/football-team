"use client";

import { useEffect, useState } from "react";
import type { UsePlayerAvatarDialogProps } from "./type";

// The avatar itself is persisted immediately by <AvatarUpload playerId=…>, so this
// hook only tracks the local preview; there's no separate Save step.
export const usePlayerAvatarDialog = ({ open, player }: UsePlayerAvatarDialogProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Sync local preview when the dialog opens for a player.
  useEffect(() => {
    if (open) setAvatarUrl(player?.avatarUrl ?? undefined);
  }, [open, player]);

  return { avatarUrl, setAvatarUrl };
};
