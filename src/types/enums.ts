import type { LineupSize, MaritalStatus, PlayerTitle, Role } from "@prisma/client";

// Type-only re-exports of the Prisma enums (erased at compile time — safe to
// import from client code). Suffixed `Enum` per the types convention.
export type RoleEnum = Role;
export type PlayerTitleEnum = PlayerTitle;
export type MaritalStatusEnum = MaritalStatus;
export type LineupSizeEnum = LineupSize;
