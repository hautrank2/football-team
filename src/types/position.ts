import type { Position } from "@prisma/client";
import type { ListQueryDto } from "./common";
import type { PlayerModel } from "./player";

// Position RESPONSE shape (technical position: GK, CB, ST, ...).
// `players` only appears when populated (`?populations=players`).
export type PositionModel = Position & {
  players?: PlayerModel[];
};

export type PositionQueryDto = ListQueryDto & {
  code?: string;
  title?: string;
  populations?: string[];
};
