import type { PlayerDto } from "@/apis/player";

export type PlayerFormDialogProps = {
  open: boolean;
  player?: PlayerDto | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export type UsePlayerFormDialogProps = PlayerFormDialogProps;
