import type { PlayerDto } from "@/apis/player";

export type PlayerAvatarDialogProps = {
  open: boolean;
  player: PlayerDto | null;
  onOpenChange: (open: boolean) => void;
};

export type UsePlayerAvatarDialogProps = PlayerAvatarDialogProps;
