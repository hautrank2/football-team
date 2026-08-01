import type { Team } from "@prisma/client";
import { http } from "@/apis/http";
import type { ListParams, TableResponse } from "@/apis/types";

export type { Team };

export type TeamListParams = ListParams & { name?: string };
export type TeamCreateInput = { name: string; shortName?: string; description?: string };
export type TeamUpdateInput = Partial<TeamCreateInput>;

export const teamApi = {
  list: (params: TeamListParams = {}) => http.get<TableResponse<Team>>("/api/team", { params }),
  get: (id: string) => http.get<Team>(`/api/team/${id}`),
  create: (body: TeamCreateInput) => http.post<Team>("/api/team", { body }),
  update: (id: string, body: TeamUpdateInput) => http.patch<Team>(`/api/team/${id}`, { body }),
  remove: (id: string) => http.delete<void>(`/api/team/${id}`),
};
