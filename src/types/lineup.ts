import type { Lineup, LineupComment, LineupSlot } from "@prisma/client";
import type { ListQueryDto } from "./common";
import type { LineupSizeEnum } from "./enums";
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

// ---- Request DTOs (client-side shapes for the API layer) ----

// One placed player on the pitch. x/y are 0-100 percentages of the field.
export type LineupSlotDto = {
  playerId: string;
  x: number;
  y: number;
  isCaptain?: boolean;
};

export type LineupCreateDto = {
  ownerId: string;
  name: string;
  size: LineupSizeEnum;
  formation: string;
  note?: string;
  isPublic?: boolean;
  slots?: LineupSlotDto[];
};

export type LineupUpdateDto = Partial<LineupCreateDto>;

export type LineupQueryDto = ListQueryDto & {
  name?: string;
  ownerId?: string;
  size?: LineupSizeEnum;
  isPublic?: boolean;
  populations?: string[];
};
