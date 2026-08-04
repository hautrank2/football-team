import type { PlayerModel } from "@/types";

export type PlayerAvatarDialogProps = {
  open: boolean;
  player: PlayerModel | null;
  onOpenChange: (open: boolean) => void;
};

export type UsePlayerAvatarDialogProps = PlayerAvatarDialogProps;
