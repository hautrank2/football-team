import { http } from "@/lib/http";
import type { TableResponseDto, TeamCreateDto, TeamModel, TeamQueryDto, TeamUpdateDto } from "@/types";

export const teamApi = {
  list: (params: TeamQueryDto = {}) =>
    http.get<TableResponseDto<TeamModel>>("/api/team", { params }),
  get: (id: string) => http.get<TeamModel>(`/api/team/${id}`),
  create: (body: TeamCreateDto) => http.post<TeamModel>("/api/team", { body }),
  update: (id: string, body: TeamUpdateDto) => http.patch<TeamModel>(`/api/team/${id}`, { body }),
  remove: (id: string) => http.delete<void>(`/api/team/${id}`),
};
