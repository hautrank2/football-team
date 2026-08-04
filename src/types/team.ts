import type { Team } from "@prisma/client";
import type { ListQueryDto } from "./common";
import type { PlayerModel } from "./player";

// Team RESPONSE shape. `players` only appears when populated (`?populations=players`).
export type TeamModel = Team & {
  players?: PlayerModel[];
};

export type TeamQueryDto = ListQueryDto & { name?: string };
export type TeamCreateDto = { name: string; shortName?: string; description?: string };
export type TeamUpdateDto = Partial<TeamCreateDto>;
