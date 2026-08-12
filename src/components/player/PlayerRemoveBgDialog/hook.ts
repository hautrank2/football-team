"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadApi } from "@/apis/upload";
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

  // Crop state. `cropSrc` is what the cropper reads; `cropOwnsUrl` marks a blob
  // URL we created here (and must revoke) vs the existing `resultUrl` we reuse.
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOwnsUrl, setCropOwnsUrl] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const closeCrop = useCallback(() => {
    setCropSrc((prev) => {
      if (prev && cropOwnsUrl) URL.revokeObjectURL(prev);
      return null;
    });
    setCropOwnsUrl(false);
  }, [cropOwnsUrl]);

  // Clear any previous preview whenever the dialog (re)opens for a player.
  useEffect(() => {
    if (!open) return;
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResultBlob(null);
    closeCrop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Feed a ready-made cutout (a transparent PNG the admin already has) straight
  // into the preview → submit pipeline, bypassing the AI convert step.
  const setResultFromFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setResultBlob(file);
  }, []);

  // Open the cropper on whatever cutout is current: a fresh result (already a
  // same-origin blob URL) if present, otherwise the saved nobg — fetched into a
  // blob first so the crop canvas isn't tainted by the remote (R2) image.
  const openCrop = useCallback(async () => {
    if (resultUrl) {
      setCropSrc(resultUrl);
      setCropOwnsUrl(false);
      return;
    }
    if (!player?.avatarNoBg) return;
    try {
      setPreparing(true);
      const file = await urlToFile(player.avatarNoBg, `${player.id}-nobg.png`);
      setCropSrc(URL.createObjectURL(file));
      setCropOwnsUrl(true);
    } catch (err) {
      toast.error(errorMessage(err, "Không tải được ảnh để cắt"));
    } finally {
      setPreparing(false);
    }
  }, [resultUrl, player]);

  const submit = useCallback(async () => {
    if (!player || !resultBlob) return;
    const previous = player.avatarNoBg; // drop this once the new one is saved
    try {
      const type = resultBlob.type || "image/png";
      const ext = type === "image/png" ? "png" : type.split("/")[1] || "png";
      const file = new File([resultBlob], `${player.id}-nobg.${ext}`, { type });
      const { url } = await upload.mutateAsync({ file, folder: "avatars-nobg" });
      await update.mutateAsync({ id: player.id, avatarNoBg: url });
      // Best-effort: remove the replaced cutout so it doesn't orphan in R2.
      if (previous && previous !== url) uploadApi.remove(previous).catch(() => {});
      toast.success("Đã cập nhật ảnh xóa nền");
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, "Không thể cập nhật"));
    }
  }, [player, resultBlob, upload, update, onOpenChange]);

  return {
    resultUrl,
    hasResult: !!resultBlob,
    existingNoBg: player?.avatarNoBg ?? null,
    // Something to crop exists if there's a fresh result or a saved cutout.
    canCrop: !!resultUrl || !!player?.avatarNoBg,
    convert,
    converting: removeBg.isPending,
    setResultFromFile,
    cropSrc,
    openCrop,
    closeCrop,
    preparing,
    submit,
    submitting: upload.isPending || update.isPending,
  };
};
