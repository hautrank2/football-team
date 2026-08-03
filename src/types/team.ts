import type { Team } from "@prisma/client";
import type { ListQueryDto } from "./common";

export type TeamDto = Team;

export type TeamQueryDto = ListQueryDto & { name?: string };
export type TeamCreateDto = { name: string; shortName?: string; description?: string };
export type TeamUpdateDto = Partial<TeamCreateDto>;
