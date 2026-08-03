import type { PlayerDto } from "@/types";

export type PlayerAvatarDialogProps = {
  open: boolean;
  player: PlayerDto | null;
  onOpenChange: (open: boolean) => void;
};

export type UsePlayerAvatarDialogProps = PlayerAvatarDialogProps;
