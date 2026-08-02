"use client";

import { AvatarUpload } from "@/components/admin/AvatarUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlayerAvatarDialog } from "./hook";
import type { PlayerAvatarDialogProps } from "./type";

export type { PlayerAvatarDialogProps };

export const PlayerAvatarDialog = (props: PlayerAvatarDialogProps) => {
  const { open, player, onOpenChange } = props;
  const { avatarUrl, setAvatarUrl, save, isLoading } = usePlayerAvatarDialog(props);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ảnh đại diện — {player?.fullName}</DialogTitle>
        </DialogHeader>

        <fieldset disabled={isLoading}>
          <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} />
        </fieldset>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="button" disabled={isLoading} onClick={save}>
            {isLoading ? "Đang lưu…" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
