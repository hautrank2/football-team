import type { PlayerModel } from "@/types";
import type { PlayerFormValues } from "./hook";

// Outer Dialog: owns open/close + which player is being edited.
export type PlayerFormDialogProps = {
  open: boolean;
  player?: PlayerModel | null; // present = edit mode
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

// Inner Form (form-rule): a standalone component that owns no open/close state.
// It receives its initial values + lifecycle callbacks and is remounted fresh
// each time the dialog opens (via `key`), so react-hook-form re-initialises
// from `defaultValues` cleanly instead of leaking the previously edited record.
export type PlayerFormProps = {
  isEdit: boolean;
  playerId?: string; // present in edit mode → routes to update vs create
  defaultValues: PlayerFormValues;
  onStartSubmit?: () => void;
  onSuccess: () => void;
  onError?: (error: unknown) => void;
  onCancel: () => void;
};
