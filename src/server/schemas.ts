import { z } from "zod";
import { LineupSize, MaritalStatus, PlayerTitle, Role } from "@prisma/client";
import { objectId } from "./validation";

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

// ---- Position ----
export const positionCreate = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});
export const positionUpdate = positionCreate.partial();

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
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  achievements: z.array(z.string()).default([]),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  foot: z.array(star).length(2), // [left, right]
  height: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional(),
  title: z.nativeEnum(PlayerTitle),
  role: z.nativeEnum(Role).optional(),
  teamId: objectId.optional(),
  positionIds: z.array(objectId).default([]),
});
// Update: everything optional; password may be rotated too.
export const playerUpdate = playerCreate.partial();

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
