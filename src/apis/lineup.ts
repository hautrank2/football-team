import { http } from "@/lib/http";
import type {
  LineupCreateDto,
  LineupModel,
  LineupQueryDto,
  LineupUpdateDto,
  TableResponseDto,
} from "@/types";

export const lineupApi = {
  list: ({ populations, ...rest }: LineupQueryDto = {}) =>
    http.get<TableResponseDto<LineupModel>>("/api/lineup", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  get: (id: string, populations: string[] = []) =>
    http.get<LineupModel>(`/api/lineup/${id}`, {
      params: populations.length ? { populations: populations.join(",") } : undefined,
    }),
  create: (body: LineupCreateDto) => http.post<LineupModel>("/api/lineup", { body }),
  update: (id: string, body: LineupUpdateDto) =>
    http.patch<LineupModel>(`/api/lineup/${id}`, { body }),
  remove: (id: string) => http.delete<void>(`/api/lineup/${id}`),
};
