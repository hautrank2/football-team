"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRemoveBg, useUpdateAvatarNoBg, useUploadImage } from "@/hooks";
import { errorMessage } from "@/lib/error";
import { urlToFile } from "@/lib/image";
import type { UsePlayerRemoveBgDialogProps } from "./type";

// Drives the remove-background dialog: convert the current avatar via the AI
// service into a preview, then (on submit) upload the result to R2 and persist
// its URL to the player's `avatarNoBg`.
export const usePlayerRemoveBgDialog = ({
  open,
  player,
  onOpenChange,
}: UsePlayerRemoveBgDialogProps) => {
  const removeBg = useRemoveBg();
  const upload = useUploadImage();
  const update = useUpdateAvatarNoBg();

  // Local preview of the just-produced transparent PNG, kept alongside its blob
  // (the blob is what we upload on submit).
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  // Clear any previous preview whenever the dialog (re)opens for a player.
  useEffect(() => {
    if (!open) return;
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResultBlob(null);
  }, [open, player]);

  const convert = useCallback(async () => {
    if (!player?.avatarUrl) {
      toast.error("Cầu thủ chưa có ảnh đại diện");
      return;
    }
    try {
      const file = await urlToFile(player.avatarUrl, `${player.id}.png`);
      const blob = await removeBg.mutateAsync(file);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultBlob(blob);
    } catch (err) {
      toast.error(errorMessage(err, "Xóa nền thất bại"));
    }
  }, [player, removeBg]);

  const submit = useCallback(async () => {
    if (!player || !resultBlob) return;
    try {
      const file = new File([resultBlob], `${player.id}-nobg.png`, { type: "image/png" });
      const { url } = await upload.mutateAsync({ file, folder: "avatars-nobg" });
      await update.mutateAsync({ id: player.id, avatarNoBg: url });
      toast.success("Đã cập nhật ảnh xóa nền");
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, "Không thể cập nhật"));
    }
  }, [player, resultBlob, upload, update, onOpenChange]);

  return {
    resultUrl,
    hasResult: !!resultBlob,
    convert,
    converting: removeBg.isPending,
    submit,
    submitting: upload.isPending || update.isPending,
  };
};
