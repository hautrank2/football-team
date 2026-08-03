"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdatePlayer } from "@/hooks";
import type { UsePlayerAvatarDialogProps } from "./type";

export const usePlayerAvatarDialog = ({
  open,
  player,
  onOpenChange,
}: UsePlayerAvatarDialogProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  // Sync local preview when the dialog opens for a player.
  useEffect(() => {
    if (open) setAvatarUrl(player?.avatarUrl ?? undefined);
  }, [open, player]);

  const update = useUpdatePlayer();

  const save = () => {
    if (!player) return;
    update.mutate(
      { id: player.id, body: { avatarUrl: avatarUrl ?? "" } },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật ảnh");
          onOpenChange(false);
        },
        onError: () => toast.error("Không thể cập nhật ảnh"),
      }
    );
  };

  return { avatarUrl, setAvatarUrl, save, isLoading: update.isPending };
};
