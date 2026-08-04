import type { Lineup, LineupComment, LineupSlot } from "@prisma/client";
import type { PlayerModel } from "./player";

// Embedded composite inside a Lineup (no relations of its own).
export type LineupSlotModel = LineupSlot;

// Lineup RESPONSE shape (a user-built fantasy squad).
// `owner` / `comments` only appear when populated (`?populations=owner,comments`).
export type LineupModel = Lineup & {
  owner?: PlayerModel;
  comments?: LineupCommentModel[];
};

// LineupComment RESPONSE shape (one level of threading via `parentId`).
// `author` / `lineup` only appear when populated (`?populations=author,lineup`).
export type LineupCommentModel = LineupComment & {
  author?: PlayerModel;
  lineup?: LineupModel;
};
