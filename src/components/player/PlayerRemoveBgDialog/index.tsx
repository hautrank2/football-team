"use client";

import { Crop, Loader2, Sparkles, Upload } from "lucide-react";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageCropperDialog } from "@/components/ui/image-cropper";
import { usePlayerRemoveBgDialog } from "./hook";
import type { PlayerRemoveBgDialogProps } from "./type";

export type { PlayerRemoveBgDialogProps };

// Checkerboard so the transparent PNG's cut-out is obvious in the preview.
const CHECKER: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg,#d4d4d8 25%,transparent 25%),linear-gradient(-45deg,#d4d4d8 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#d4d4d8 75%),linear-gradient(-45deg,transparent 75%,#d4d4d8 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
};

export const PlayerRemoveBgDialog = (props: PlayerRemoveBgDialogProps) => {
  const { open, player, onOpenChange } = props;
  const s = usePlayerRemoveBgDialog(props);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (file) s.setResultFromFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Xóa nền ảnh — {player?.fullName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">Ảnh hiện tại</span>
            <Avatar className="size-80 rounded-md">
              <AvatarImage
                src={player?.avatarUrl ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="rounded-md">
                {player?.fullName.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {s.resultUrl ? "Kết quả mới" : "Ảnh nền hiện tại"}
            </span>
            <div
              className="flex size-80 items-center justify-center overflow-hidden rounded-md border"
              style={CHECKER}
            >
              {s.resultUrl ?? s.existingNoBg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.resultUrl ?? s.existingNoBg ?? undefined}
                  alt="Ảnh đã xóa nền"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="px-2 text-center text-xs text-muted-foreground">
                  Chưa có
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/*"
            hidden
            onChange={onPick}
          />
          {/* Produce a cutout: from the avatar via AI, or by uploading one. */}
          <Button
            type="button"
            onClick={s.convert}
            disabled={s.converting || s.submitting || !player?.avatarUrl}
          >
            {s.converting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {s.converting ? "Đang tách…" : "Tách nền (AI)"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={s.converting || s.submitting}
          >
            <Upload className="size-4" />
            Tải ảnh
          </Button>
          {/* Crop the fresh result, or the saved cutout if nothing new yet. */}
          <Button
            type="button"
            variant="outline"
            onClick={s.openCrop}
            disabled={!s.canCrop || s.converting || s.submitting || s.preparing}
          >
            {s.preparing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Crop className="size-4" />
            )}
            Cắt ảnh
          </Button>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={s.submit}
            disabled={!s.hasResult || s.submitting}
          >
            {s.submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Crop the current cutout — square frame. PNG output keeps transparency. */}
      <ImageCropperDialog
        open={!!s.cropSrc}
        src={s.cropSrc}
        fileName={player ? `${player.id}-nobg` : undefined}
        outputType="image/png"
        checker
        title="Cắt ảnh xóa nền"
        onCancel={s.closeCrop}
        onCropped={(file) => {
          s.setResultFromFile(file);
          s.closeCrop();
        }}
      />
    </Dialog>
  );
};
