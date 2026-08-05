import { useQuery } from "@tanstack/react-query";
import { positionApi } from "@/apis/position";
import type { PositionQueryDto } from "@/types";

const KEY = "positions";

export const usePositions = (params: PositionQueryDto = {}) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => positionApi.list(params) });
