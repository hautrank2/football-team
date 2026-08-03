import type { TeamDto } from "@/types";

export type TeamFormDialogProps = {
  open: boolean;
  team?: TeamDto | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export type UseTeamFormDialogProps = TeamFormDialogProps;
