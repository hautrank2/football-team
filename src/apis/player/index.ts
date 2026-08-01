import type { Player, Team } from "@prisma/client";
import { http } from "@/apis/http";
import type { ListParams, TableResponse } from "@/apis/types";

// API never returns the password hash; may include populated relations.
export type PlayerDto = Omit<Player, "passwordHash"> & { team?: Team | null };

export type PlayerListParams = ListParams & {
  fullName?: string;
  username?: string;
  title?: string;
  teamId?: string;
  populations?: string[];
};

export type PlayerCreateInput = {
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
export type PlayerUpdateInput = Partial<PlayerCreateInput>;

export const playerApi = {
  list: ({ populations, ...rest }: PlayerListParams = {}) =>
    http.get<TableResponse<PlayerDto>>("/api/player", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  get: (id: string) => http.get<PlayerDto>(`/api/player/${id}`, { params: { populations: "team" } }),
  create: (body: PlayerCreateInput) => http.post<PlayerDto>("/api/player", { body }),
  update: (id: string, body: PlayerUpdateInput) => http.patch<PlayerDto>(`/api/player/${id}`, { body }),
  remove: (id: string) => http.delete<void>(`/api/player/${id}`),
  // Reset password to the convention "<username>@123".
  resetPassword: (id: string, username: string) =>
    http.patch<PlayerDto>(`/api/player/${id}`, { body: { password: `${username}@123` } }),
};
