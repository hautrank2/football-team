import { http } from "@/lib/http";
import type { PositionModel, PositionQueryDto, TableResponseDto } from "@/types";

export const positionApi = {
  list: ({ populations, ...rest }: PositionQueryDto = {}) =>
    http.get<TableResponseDto<PositionModel>>("/api/position", {
      params: { ...rest, populations: populations?.join(",") },
    }),
  get: (id: string) => http.get<PositionModel>(`/api/position/${id}`),
};
