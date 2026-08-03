import { http } from "@/lib/http";
import type { TableResponseDto, TeamCreateDto, TeamDto, TeamQueryDto, TeamUpdateDto } from "@/types";

export const teamApi = {
  list: (params: TeamQueryDto = {}) => http.get<TableResponseDto<TeamDto>>("/api/team", { params }),
  get: (id: string) => http.get<TeamDto>(`/api/team/${id}`),
  create: (body: TeamCreateDto) => http.post<TeamDto>("/api/team", { body }),
  update: (id: string, body: TeamUpdateDto) => http.patch<TeamDto>(`/api/team/${id}`, { body }),
  remove: (id: string) => http.delete<void>(`/api/team/${id}`),
};
