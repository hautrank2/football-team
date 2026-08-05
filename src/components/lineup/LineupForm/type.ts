import type { LineupModel } from "@/types";

export type LineupFormProps = {
  mode: "create" | "edit";
  ownerId: string;
  // Present in edit mode — pre-fills the form.
  initial?: LineupModel;
};
