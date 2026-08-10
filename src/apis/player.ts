import { http } from "@/lib/http";
import type {
  AttributeUpsertDto,
  AvatarNoBgBulkItem,
  ChangePasswordDto,
  PlayerAttributeModel,
  PlayerCreateDto,
  PlayerModel,
  PlayerQueryDto,
  PlayerUpdateDto,
  TableResponseDto,
} from "@/types";

export const playerApi = {
  list: ({ populations, positions, ...rest }: PlayerQueryDto = {}) =>
    http.get<TableResponseDto<PlayerModel>>("/api/player", {
      params: {
        ...rest,
        positions: positions?.length ? positions.join(",") : undefined,
        populations: populations?.join(","),
      },
    }),
  get: (id: string, populations: string[] = ["team"]) =>
    http.get<PlayerModel>(`/api/player/${id}`, {
      params: { populations: populations.join(",") },
    }),
  create: (body: PlayerCreateDto) => http.post<PlayerModel>("/api/player", body),
  update: (id: string, body: PlayerUpdateDto) =>
    http.patch<PlayerModel>(`/api/player/${id}`, body),
  // Persist the background-removed avatar via its dedicated endpoint.
  updateAvatarNoBg: (id: string, avatarNoBg: string) =>
    http.patch<PlayerModel>(`/api/player/${id}/avatar-nobg`, { avatarNoBg }),
  // Bulk-persist background-removed avatars for many players in one request.
  updateAvatarNoBgBulk: (items: AvatarNoBgBulkItem[]) =>
    http.patch<PlayerModel[]>("/api/player/avatar-nobg", { items }),
  remove: (id: string) => http.delete<void>(`/api/player/${id}`),
  // Reset password to the convention "<username>@123".
  resetPassword: (id: string, username: string) =>
    http.patch<PlayerModel>(`/api/player/${id}`, { password: `${username}@123` }),
  // Change own password (verifies the current password server-side).
  changePassword: (id: string, body: ChangePasswordDto) =>
    http.patch<{ success: boolean }>(`/api/player/${id}/password`, body),
  // FIFA-style attribute set (1-1 with the player). GET 404s when none exist yet.
  getAttribute: (id: string) => http.get<PlayerAttributeModel>(`/api/player/${id}/attribute`),
  upsertAttribute: (id: string, body: AttributeUpsertDto) =>
    http.patch<PlayerAttributeModel>(`/api/player/${id}/attribute`, body),
};
