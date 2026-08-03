import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@/apis/team";
import type { TeamCreateDto, TeamQueryDto, TeamUpdateDto } from "@/types";

const KEY = "teams";

export const useTeams = (params: TeamQueryDto) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => teamApi.list(params) });

export const useTeam = (id?: string) =>
  useQuery({ queryKey: [KEY, id], queryFn: () => teamApi.get(id as string), enabled: !!id });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TeamCreateDto) => teamApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TeamUpdateDto }) => teamApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
