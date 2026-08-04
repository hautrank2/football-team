import type { TeamModel } from "@/types";
import type { TeamFormValues } from "./hook";

// Outer Dialog: owns open/close + which team is being edited.
export type TeamFormDialogProps = {
  open: boolean;
  team?: TeamModel | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

// Inner Form (form-rule): standalone, no open/close state. Reusable inline on a page.
export type TeamFormProps = {
  isEdit: boolean;
  teamId?: string; // present in edit mode → routes to update vs create
  defaultValues: TeamFormValues;
  onStartSubmit?: () => void;
  onSuccess: () => void;
  onError?: (error: unknown) => void;
  onCancel: () => void;
};
