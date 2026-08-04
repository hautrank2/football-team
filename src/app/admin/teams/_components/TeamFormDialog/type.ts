import type { TeamModel } from "@/types";

export type TeamFormDialogProps = {
  open: boolean;
  team?: TeamModel | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export type UseTeamFormDialogProps = TeamFormDialogProps;
