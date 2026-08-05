import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lineupApi } from "@/apis/lineup";
import type { LineupCreateDto, LineupQueryDto, LineupUpdateDto } from "@/types";

const KEY = "lineups";

export const useLineups = (params: LineupQueryDto = {}, enabled = true) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => lineupApi.list(params), enabled });

export const useLineup = (id?: string, populations?: string[]) =>
  useQuery({
    queryKey: [KEY, id, populations],
    queryFn: () => lineupApi.get(id as string, populations),
    enabled: !!id,
  });

export const useCreateLineup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LineupCreateDto) => lineupApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateLineup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: LineupUpdateDto }) =>
      lineupApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteLineup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lineupApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
