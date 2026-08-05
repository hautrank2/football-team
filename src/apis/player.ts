import { http } from "@/lib/http";
import type {
  ChangePasswordDto,
  PlayerCreateDto,
  PlayerModel,
  PlayerQueryDto,
  PlayerUpdateDto,
  TableResponseDto,
} from "@/types";

export const playerApi = {
  list: ({ populations, ...rest }: PlayerQueryDto = {}) =>
    http.get<TableResponseDto<PlayerModel>>("/api/player", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  get: (id: string, populations: string[] = ["team"]) =>
    http.get<PlayerModel>(`/api/player/${id}`, {
      params: { populations: populations.join(",") },
    }),
  create: (body: PlayerCreateDto) => http.post<PlayerModel>("/api/player", { body }),
  update: (id: string, body: PlayerUpdateDto) =>
    http.patch<PlayerModel>(`/api/player/${id}`, { body }),
  remove: (id: string) => http.delete<void>(`/api/player/${id}`),
  // Reset password to the convention "<username>@123".
  resetPassword: (id: string, username: string) =>
    http.patch<PlayerModel>(`/api/player/${id}`, { body: { password: `${username}@123` } }),
  // Change own password (verifies the current password server-side).
  changePassword: (id: string, body: ChangePasswordDto) =>
    http.patch<{ success: boolean }>(`/api/player/${id}/password`, { body }),
};
