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
  const { avatarUrl, setAvatarUrl } = usePlayerAvatarDialog(props);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ảnh đại diện — {player?.fullName}</DialogTitle>
        </DialogHeader>

        {/* Đổi/xóa ảnh là lưu ngay — không cần nút Lưu riêng. */}
        <AvatarUpload
          value={avatarUrl}
          onChange={setAvatarUrl}
          playerId={player?.id}
          onSaved={() => onOpenChange(false)}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
