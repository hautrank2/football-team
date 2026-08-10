import type { PlayerModel } from "@/types";

export type PlayerRemoveBgBatchDialogProps = {
  open: boolean;
  players: PlayerModel[];
  onOpenChange: (open: boolean) => void;
  // Called after a successful bulk save (e.g. to clear the table selection).
  onDone?: () => void;
};

export type UsePlayerRemoveBgBatchDialogProps = PlayerRemoveBgBatchDialogProps;
