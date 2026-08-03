import type { PlayerDto } from "@/types";

export type PlayerFormDialogProps = {
  open: boolean;
  player?: PlayerDto | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export type UsePlayerFormDialogProps = PlayerFormDialogProps;
