import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  playerApi,
  type PlayerCreateInput,
  type PlayerListParams,
  type PlayerUpdateInput,
} from "./index";

const KEY = "players";

export const usePlayers = (params: PlayerListParams) =>
  useQuery({ queryKey: [KEY, params], queryFn: () => playerApi.list(params) });

export const usePlayer = (id?: string) =>
  useQuery({ queryKey: [KEY, id], queryFn: () => playerApi.get(id as string), enabled: !!id });

export const useCreatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlayerCreateInput) => playerApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useUpdatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PlayerUpdateInput }) => playerApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeletePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => playerApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useResetPlayerPassword = () =>
  useMutation({
    mutationFn: ({ id, username }: { id: string; username: string }) =>
      playerApi.resetPassword(id, username),
  });
