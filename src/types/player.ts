import type { Player, PlayerAttribute, PlayerQuote } from "@prisma/client";
import type { ListQueryDto } from "./common";
import type { TeamModel } from "./team";
import type { LineupModel } from "./lineup";

// Player RESPONSE shape (a player is also the login account). Never carries the
// password hash — the API always strips it. Relations are optional (`?`) since
// they only appear when the caller opts in via `?populations=...`; each points
// at the OTHER entity's Model so nested populate stays typed.
export type PlayerModel = Omit<Player, "passwordHash"> & {
  team?: TeamModel | null;
  attribute?: PlayerAttributeModel | null;
  quotesReceived?: PlayerQuoteModel[];
  quotesWritten?: PlayerQuoteModel[];
  lineups?: LineupModel[];
};

// PlayerAttribute RESPONSE shape (FIFA-style ratings, 1-1 with Player).
// No relations of its own beyond the owning player.
export type PlayerAttributeModel = PlayerAttribute;

// Request body for the attribute upsert (all rating fields; GK ones optional).
export type AttributeUpsertDto = Omit<
  PlayerAttribute,
  "id" | "playerId" | "createdAt" | "updatedAt"
>;

// PlayerQuote RESPONSE shape (a quote one player writes about another).
// `subject` / `author` only appear when populated (`?populations=subject,author`).
export type PlayerQuoteModel = PlayerQuote & {
  subject?: PlayerModel;
  author?: PlayerModel;
};

export type PlayerCreateDto = {
  username: string;
  password: string;
  fullName: string;
  birthday: string; // ISO
  title: string;
  foot: [number, number];
  nickname?: string;
  avatarUrl?: string;
  avatarNoBg?: string;
  bio?: string;
  gender?: string;
  maritalStatus?: string;
  jerseyNumber?: number;
  height?: number;
  weight?: number;
  teamId?: string;
  positions?: string[];
  phone?: string;
  socials?: { type: string; link: string }[];
  address?: string;
  coordinate?: [number, number]; // [lng, lat], Mapbox-only
};

export type PlayerUpdateDto = Partial<PlayerCreateDto>;

export type PlayerQueryDto = ListQueryDto & {
  fullName?: string;
  nickname?: string;
  username?: string;
  title?: string;
  teamId?: string;
  positions?: string[];
  populations?: string[];
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};
