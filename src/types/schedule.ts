import type { Match, MatchMvpVote, MatchPlayer, MatchVote } from "@prisma/client";
import type { ListQueryDto } from "./common";
import type { MatchStatusEnum } from "./enums";
import type { PlayerModel } from "./player";

// ---------------------------------------------------------------------------
// RESPONSE shapes. Relations are optional (`?`) — they only appear when the
// caller opts in via `?populations=...`, mirroring the other Model types.
// ---------------------------------------------------------------------------

// A player's intent to play on a given day (self + guests).
export type MatchVoteModel = MatchVote & {
  player?: PlayerModel;
  match?: MatchModel | null;
};

// A confirmed match built from the votes on a chosen day.
export type MatchModel = Match & {
  mvpPlayers?: PlayerModel[];
  players?: MatchPlayerModel[];
  mvpVotes?: MatchMvpVoteModel[];
  votes?: MatchVoteModel[];
};

// One player on a match's participant list — money split + goals/assists + payment.
export type MatchPlayerModel = MatchPlayer & {
  player?: PlayerModel;
  match?: MatchModel;
};

// One MVP ballot cast by a participant.
export type MatchMvpVoteModel = MatchMvpVote & {
  voter?: PlayerModel;
  mvpPlayer?: PlayerModel;
  match?: MatchModel;
};

// ---------------------------------------------------------------------------
// Request DTOs (client-side shapes for the API layer). Validated by the zod
// schemas of the same name in ./schemas.
// ---------------------------------------------------------------------------

export type MatchVoteUpsertDto = {
  playerId: string;
  voteDate: string; // yyyy-MM-dd (calendar day; server anchors to UTC midnight)
  guestCount?: number;
  note?: string;
};

export type MatchCreateDto = {
  matchDate: string; // yyyy-MM-dd (calendar day; server anchors to UTC midnight)
  kickoffAt?: string; // ISO datetime; defaults to 19:00 matchDate
  location?: string;
  note?: string;
  // Quick-create: participants picked by the admin, skipping the vote step.
  players?: ParticipantAddDto[];
};

export type MatchUpdateDto = {
  kickoffAt?: string;
  location?: string;
  note?: string;
  status?: MatchStatusEnum;
};

export type MatchSettleCostDto = { fieldCost: number };

export type ReportStatsDto = {
  playerId: string;
  goals: number;
  assists: number;
};

export type MvpVoteDto = {
  voterId: string;
  mvpPlayerId: string;
};

export type ParticipantPaymentDto = { isPaid: boolean };

export type ParticipantAddDto = { playerId: string; guestCount?: number };

// ---------------------------------------------------------------------------
// Query DTOs
// ---------------------------------------------------------------------------

export type MatchVoteQueryDto = ListQueryDto & {
  playerId?: string;
  matchId?: string;
  startVoteDateAt?: string;
  endVoteDateAt?: string;
  populations?: string[];
};

export type MatchQueryDto = ListQueryDto & {
  status?: MatchStatusEnum;
  playerId?: string; // matches this player took part in
  startMatchDateAt?: string;
  endMatchDateAt?: string;
  populations?: string[];
};

export type MatchPlayerQueryDto = ListQueryDto & {
  matchId?: string;
  playerId?: string;
  isPaid?: boolean;
  populations?: string[];
};

export type LeaderboardQueryDto = {
  startAt?: string; // ISO — default: start of current quarter
  endAt?: string; // ISO — default: end of current quarter
  limit?: number;
};

// ---------------------------------------------------------------------------
// Derived / aggregate shapes (computed at the API layer — not stored)
// ---------------------------------------------------------------------------

// "Trận đấu của tôi" — one row per match a player joined.
export type MyMatchRow = {
  match: MatchModel;
  goals: number;
  assists: number;
  amountDue: number;
  isPaid: boolean;
};

export type MyMatchesSummary = {
  matches: MyMatchRow[];
  totalDebt: number; // Σ amountDue where !isPaid
  totalGoals: number;
  totalAssists: number;
};

// "Vua phá lưới" / "Vua kiến tạo" — leaderboard row.
export type LeaderboardRow = {
  player: PlayerModel;
  goals: number;
  assists: number;
  matchesPlayed: number;
};
