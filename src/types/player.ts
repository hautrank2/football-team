import type { Player, Team } from "@prisma/client";
import type { ListQueryDto } from "./common";

// API response for a player. Never includes the password hash; may carry a
// populated `team` relation.
export type PlayerDto = Omit<Player, "passwordHash"> & { team?: Team | null };

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
  maritalStatus?: string;
  jerseyNumber?: number;
  height?: number;
  weight?: number;
  teamId?: string;
  positionIds?: string[];
};

export type PlayerUpdateDto = Partial<PlayerCreateDto>;

export type PlayerQueryDto = ListQueryDto & {
  fullName?: string;
  username?: string;
  title?: string;
  teamId?: string;
  populations?: string[];
};

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
};
