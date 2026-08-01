import type { Team } from "@prisma/client";

export type TeamFormDialogProps = {
  open: boolean;
  team?: Team | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export type UseTeamFormDialogProps = TeamFormDialogProps;
