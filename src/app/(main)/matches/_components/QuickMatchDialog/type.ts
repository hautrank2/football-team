// Outer Dialog: owns open/close only.
export type QuickMatchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (matchId: string) => void;
};

// Inner Form (form-rule): owns no open/close state. Remounted per open via
// `key` so a cancelled draft never leaks into the next session.
export type QuickMatchFormProps = {
  onSuccess: (matchId: string) => void;
  onCancel: () => void;
};
