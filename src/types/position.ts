import type { Position } from "@prisma/client";
import type { PlayerModel } from "./player";

// Position RESPONSE shape (technical position: GK, CB, ST, ...).
// `players` only appears when populated (`?populations=players`).
export type PositionModel = Position & {
  players?: PlayerModel[];
};
