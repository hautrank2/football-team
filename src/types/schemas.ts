import { z } from "zod";
import {
  Gender,
  LineupSize,
  MaritalStatus,
  MatchStatus,
  PlayerPosition,
  PlayerTitle,
  Role,
  SocialType,
} from "@prisma/client";
import { SCHEDULE_LIMITS } from "@/constants/schedule";
import { objectId } from "./common";

// Reusable location schemas (address freely editable; coordinate = [lng, lat],
// only ever set from a Mapbox pick).
const address = z.string().max(SCHEDULE_LIMITS.ADDRESS_MAX).optional();
const coordinate = z
  .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
  .optional();

// Request-body validation schemas (server-side). Kept alongside the DTO types
// they define. Client code only ever imports the inferred *types* from here, so
// the @prisma/client runtime pulled in below never reaches the browser bundle.

// Reusable value schemas
const rating = z.number().int().min(0).max(99); // skill attributes
const star = z.number().int().min(1).max(5); // weak/skill stars, foot ratings

// ---- Team ----
export const teamCreate = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1).optional(),
  description: z.string().optional(),
});
export const teamUpdate = teamCreate.partial();

// ---- Player ----
export const playerCreate = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(1),
  nickname: z.string().optional(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).optional(),
  avatarNoBg: z.union([z.string().url(), z.literal("")]).optional(),
  bio: z.string().optional(),
  birthday: z.coerce.date(),
  gender: z.nativeEnum(Gender).default("MALE"),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  achievements: z.array(z.string()).default([]),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  foot: z.array(star).length(2), // [left, right]
  height: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional(),
  title: z.nativeEnum(PlayerTitle),
  role: z.nativeEnum(Role).optional(),
  teamId: objectId.optional(),
  positions: z.array(z.nativeEnum(PlayerPosition)).default([]),
  phone: z
    .union([z.string().regex(/^\d{10,11}$/, "Số điện thoại 10–11 chữ số"), z.literal("")])
    .optional(),
  socials: z
    .array(z.object({ type: z.nativeEnum(SocialType), link: z.string().url("Link không hợp lệ") }))
    .max(4, "Tối đa 4 mạng xã hội")
    .default([]),
  address,
  coordinate,
});
// Update: everything optional; password may be rotated too.
export const playerUpdate = playerCreate.partial();

// Dedicated body for persisting the background-removed avatar URL.
export const avatarNoBgUpdate = z.object({
  avatarNoBg: z.union([z.string().url(), z.literal("")]),
});

// Bulk variant: update many players' background-removed avatars in one request.
export const avatarNoBgBulkUpdate = z.object({
  items: z
    .array(
      z.object({
        id: objectId,
        avatarNoBg: z.union([z.string().url(), z.literal("")]),
      })
    )
    .min(1),
});

// ---- PlayerAttribute (upsert) ----
export const attributeUpsert = z.object({
  overall: rating,
  skillMoves: star,
  // Pace
  acceleration: rating,
  sprintSpeed: rating,
  // Shooting
  attPositioning: rating,
  finishing: rating,
  shotPower: rating,
  longShots: rating,
  volleys: rating,
  penalties: rating,
  // Passing
  vision: rating,
  crossing: rating,
  freeKick: rating,
  shortPassing: rating,
  longPassing: rating,
  curve: rating,
  // Dribbling
  agility: rating,
  balance: rating,
  reactions: rating,
  ballControl: rating,
  dribbling: rating,
  composure: rating,
  // Defending
  interceptions: rating,
  heading: rating,
  defAwareness: rating,
  standingTackle: rating,
  slidingTackle: rating,
  // Physical
  jumping: rating,
  stamina: rating,
  strength: rating,
  aggression: rating,
  // Goalkeeping (optional)
  gkDiving: rating.optional(),
  gkHandling: rating.optional(),
  gkKicking: rating.optional(),
  gkReflexes: rating.optional(),
  gkPositioning: rating.optional(),
});

// ---- PlayerQuote ----
export const quoteCreate = z.object({
  subjectId: objectId,
  authorId: objectId,
  content: z.string().min(1),
});
export const quoteUpdate = z.object({ content: z.string().min(1) });

// ---- Lineup ----
const lineupSlot = z.object({
  playerId: objectId,
  x: z.number().int().min(0).max(100),
  y: z.number().int().min(0).max(100),
  isCaptain: z.boolean().default(false),
});
export const lineupCreate = z.object({
  ownerId: objectId,
  name: z.string().min(1),
  size: z.nativeEnum(LineupSize),
  formation: z.string().min(1),
  note: z.string().optional(),
  isPublic: z.boolean().default(true),
  slots: z.array(lineupSlot).default([]),
});
export const lineupUpdate = lineupCreate.partial();

// ---- LineupComment ----
export const lineupCommentCreate = z.object({
  authorId: objectId,
  content: z.string().min(1),
  parentId: objectId.optional(),
});
export const lineupCommentUpdate = z.object({ content: z.string().min(1) });

// ---- Auth ----
export const authLogin = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// ---- Change password (verifies the current one server-side) ----
export const changePassword = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

// ---- Schedule / Match ----
const note = z.string().max(SCHEDULE_LIMITS.NOTE_MAX).optional();
const guestCount = z.number().int().min(0).max(SCHEDULE_LIMITS.GUEST_MAX);

// Upsert a vote for a day (server validates the date is votable).
export const matchVoteUpsert = z.object({
  playerId: objectId,
  voteDate: z.coerce.date(),
  guestCount: guestCount.default(0),
  note,
});

// Admin confirms a day → creates a match. kickoffAt defaults to 19:00 matchDate.
export const matchCreate = z.object({
  matchDate: z.coerce.date(),
  kickoffAt: z.coerce.date().optional(),
  location: z.string().max(SCHEDULE_LIMITS.ADDRESS_MAX).optional(),
  note,
});

export const matchUpdate = z.object({
  kickoffAt: z.coerce.date().optional(),
  location: z.string().max(SCHEDULE_LIMITS.ADDRESS_MAX).optional(),
  note,
  status: z.nativeEnum(MatchStatus).optional(),
});

// Admin enters field cost → server recomputes the whole split.
export const matchSettleCost = z.object({
  fieldCost: z.number().int().min(0),
});

// Participant self-reports goals + assists (report window only).
export const reportStats = z.object({
  playerId: objectId,
  goals: z.number().int().min(0).max(SCHEDULE_LIMITS.GOALS_MAX),
  assists: z.number().int().min(0).max(SCHEDULE_LIMITS.ASSISTS_MAX),
});

// Participant votes one player as MVP (report window only).
export const mvpVoteCreate = z.object({
  voterId: objectId,
  mvpPlayerId: objectId,
});

// Admin toggles a participant's payment state.
export const participantPayment = z.object({
  isPaid: z.boolean(),
});

// Admin adds a player to a match's participant list (+ their guest count).
export const participantAdd = z.object({
  playerId: objectId,
  guestCount: guestCount.default(0),
});
