"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadApi } from "@/apis/upload";
import { useRemoveBgBatch, useUpdateAvatarNoBgBulk } from "@/hooks";
import { errorMessage } from "@/lib/error";
import { urlToFile } from "@/lib/image";
import type { UsePlayerRemoveBgBatchDialogProps } from "./type";

// Drives the bulk remove-background dialog: convert every selected player's
// avatar in ONE AI request, preview the results, then (on submit) upload each
// result and persist them all in ONE bulk update.
export const usePlayerRemoveBgBatchDialog = ({
  open,
  players,
  onOpenChange,
  onDone,
}: UsePlayerRemoveBgBatchDialogProps) => {
  const removeBg = useRemoveBgBatch();
  const bulkUpdate = useUpdateAvatarNoBgBulk();

  // Per-player preview URLs + the blobs we'll upload, keyed by player id.
  const [resultUrls, setResultUrls] = useState<Record<string, string>>({});
  const [resultBlobs, setResultBlobs] = useState<Record<string, Blob>>({});
  const [uploading, setUploading] = useState(false);

  const clearPreviews = useCallback(() => {
    setResultUrls((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
    setResultBlobs({});
  }, []);

  // Reset previews whenever the dialog (re)opens.
  useEffect(() => {
    if (open) clearPreviews();
  }, [open, clearPreviews]);

  const convert = useCallback(async () => {
    const withAvatar = players.filter((p) => p.avatarUrl);
    if (!withAvatar.length) {
      toast.error("Không có cầu thủ nào có ảnh để xử lý");
      return;
    }
    try {
      // Build one FormData part per player (key = player id → "<id>.png" in zip).
      const files: Record<string, File> = {};
      await Promise.all(
        withAvatar.map(async (p) => {
          files[p.id] = await urlToFile(p.avatarUrl as string, `${p.id}.png`);
        })
      );
      const blobs = await removeBg.mutateAsync(files); // one AI request

      clearPreviews();
      const urls: Record<string, string> = {};
      for (const [id, blob] of Object.entries(blobs)) urls[id] = URL.createObjectURL(blob);
      setResultUrls(urls);
      setResultBlobs(blobs);

      const skipped = players.length - withAvatar.length;
      if (skipped > 0) toast.message(`Bỏ qua ${skipped} cầu thủ chưa có ảnh`);
    } catch (err) {
      toast.error(errorMessage(err, "Xóa nền thất bại"));
    }
  }, [players, removeBg, clearPreviews]);

  const submit = useCallback(async () => {
    const entries = Object.entries(resultBlobs);
    if (!entries.length) return;
    try {
      setUploading(true);
      // Snapshot each player's current cutout so we can drop it once replaced.
      const prevById = new Map(players.map((p) => [p.id, p.avatarNoBg]));
      // Upload every result to R2 (parallel), then persist all in one request.
      const items = await Promise.all(
        entries.map(async ([id, blob]) => {
          const file = new File([blob], `${id}-nobg.png`, { type: "image/png" });
          const { url } = await uploadApi.image(file, "avatars-nobg");
          return { id, avatarNoBg: url };
        })
      );
      await bulkUpdate.mutateAsync(items); // one bulk update
      // Best-effort: remove the replaced cutouts so they don't orphan in R2.
      for (const { id, avatarNoBg } of items) {
        const prev = prevById.get(id);
        if (prev && prev !== avatarNoBg) uploadApi.remove(prev).catch(() => {});
      }
      toast.success(`Đã cập nhật ${items.length} ảnh xóa nền`);
      onDone?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessage(err, "Không thể cập nhật"));
    } finally {
      setUploading(false);
    }
  }, [players, resultBlobs, bulkUpdate, onDone, onOpenChange]);

  return {
    resultUrls,
    resultCount: Object.keys(resultBlobs).length,
    convert,
    converting: removeBg.isPending,
    submit,
    submitting: uploading || bulkUpdate.isPending,
  };
};
