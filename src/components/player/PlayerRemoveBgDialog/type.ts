import type { PlayerModel } from "@/types";

export type PlayerRemoveBgDialogProps = {
  open: boolean;
  player: PlayerModel | null;
  onOpenChange: (open: boolean) => void;
};

export type UsePlayerRemoveBgDialogProps = PlayerRemoveBgDialogProps;
